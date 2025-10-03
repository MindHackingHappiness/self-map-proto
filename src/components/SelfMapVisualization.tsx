import { useMemo, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Entry, Association, SizeMetric, RadiusMode } from '@/types/selfmap';
import {
  computePositionByValence,
  computePositionByPower,
  calculateWeightedDegree,
  getSizesForCategory,
  getColorsForCategory,
  generateRingGuides,
  R_MAX
} from '@/utils/visualization';
import { HoverInfo } from './HoverInfo';

interface SelfMapVisualizationProps {
  entries: Entry[];
  associations: Association[];
  sizeMetric: SizeMetric;
  radiusMode: RadiusMode;
  showEdges: boolean;
  showLabels: boolean;
  sizeScale: number;
  opacity: number;
}

const CATEGORIES = ['People', 'Accomplishments', 'Life Story', 'Ideas/Likes', 'Other'];

const CATEGORY_SYMBOLS: Record<string, string> = {
  'People': 'circle',
  'Accomplishments': 'square',
  'Life Story': 'diamond',
  'Ideas/Likes': 'cross',
  'Other': 'triangle-up'
};

const EDGE_STYLES: Record<string, { color: string; width: number }> = {
  'affirms': { color: 'rgba(102,187,106,0.45)', width: 2 },
  'threatens': { color: 'rgba(239,83,80,0.50)', width: 2 },
  'associates_with': { color: 'rgba(144,202,249,0.40)', width: 2 }
};

export const SelfMapVisualization = ({
  entries,
  associations,
  sizeMetric,
  radiusMode,
  showEdges,
  showLabels,
  sizeScale,
  opacity
}: SelfMapVisualizationProps) => {
  const [hoveredEntry, setHoveredEntry] = useState<Entry | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageTimeout, setImageTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dimmedNodes, setDimmedNodes] = useState<Set<string>>(new Set());

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (imageTimeout) {
        clearTimeout(imageTimeout);
      }
    };
  }, [imageTimeout]);

  const { positions, weightedDegrees, traces } = useMemo(() => {
    const positionsVal = computePositionByValence(entries);
    const positionsPow = computePositionByPower(entries);
    const positions = radiusMode === 'valence' ? positionsVal : positionsPow;
    const weightedDegrees = calculateWeightedDegree(entries, associations);

    const entriesByCategory: Record<string, Entry[]> = {};
    CATEGORIES.forEach(cat => {
      entriesByCategory[cat] = entries.filter(e => e.category === cat);
    });

    const traces: any[] = [];

    // Add ring guides
    const ringGuides = generateRingGuides(R_MAX);
    ringGuides.forEach(ring => {
      traces.push({
        x: ring.x,
        y: ring.y,
        mode: 'lines',
        line: { color: 'rgba(200,200,200,0.12)', width: 1 },
        hoverinfo: 'skip',
        showlegend: false
      });
    });

    // Add crosshairs
    traces.push({
      x: [-R_MAX, R_MAX],
      y: [0, 0],
      mode: 'lines',
      line: { color: 'rgba(200,200,200,0.18)', width: 1, dash: 'dot' },
      hoverinfo: 'skip',
      showlegend: false
    });
    traces.push({
      x: [0, 0],
      y: [-R_MAX, R_MAX],
      mode: 'lines',
      line: { color: 'rgba(200,200,200,0.18)', width: 1, dash: 'dot' },
      hoverinfo: 'skip',
      showlegend: false
    });

    // Add edges
    if (showEdges) {
      Object.entries(EDGE_STYLES).forEach(([relation, style]) => {
        const edgeX: number[] = [];
        const edgeY: number[] = [];

        associations.forEach(assoc => {
          if (assoc.relation === relation) {
            const srcPos = positions[assoc.src];
            const dstPos = positions[assoc.dst];
            if (srcPos && dstPos) {
              edgeX.push(srcPos.x, dstPos.x, null as any);
              edgeY.push(srcPos.y, dstPos.y, null as any);
            }
          }
        });

        if (edgeX.length > 0) {
          traces.push({
            x: edgeX,
            y: edgeY,
            mode: 'lines',
            line: { color: style.color, width: style.width },
            hoverinfo: 'skip',
            showlegend: false
          });
        }
      });
    }

    // Add center point
    traces.push({
      x: [0],
      y: [0],
      mode: 'markers+text',
      marker: {
        size: 20,
        color: 'rgba(255,215,0,0.95)',
        symbol: 'star',
        line: { color: '#FFD700', width: 2 }
      },
      text: ['Self'],
      textposition: 'top center',
      textfont: { color: 'rgba(255,255,255,0.95)', size: 12 },
      hovertemplate: 'Self<br>Center reference<extra></extra>',
      name: 'Self',
      showlegend: false
    });

    // Add category data points
    CATEGORIES.forEach(category => {
      const categoryEntries = entriesByCategory[category];
      if (categoryEntries.length === 0) return;

      const xs = categoryEntries.map(e => positions[e.label]?.x || 0);
      const ys = categoryEntries.map(e => positions[e.label]?.y || 0);
      const sizes = getSizesForCategory(categoryEntries, sizeMetric, weightedDegrees, sizeScale);
      const colors = getColorsForCategory(categoryEntries, opacity);
      
      // Apply dimming if nodes are dimmed
      const displayColors = colors.map((color, idx) => {
        const label = categoryEntries[idx].label;
        if (dimmedNodes.has(label)) {
          // Make dimmed nodes very dark with just outline
          return color.replace(/[\d.]+\)$/, '0.15)');
        }
        return color;
      });

      // Glow effect
      traces.push({
        x: xs,
        y: ys,
        mode: 'markers',
        marker: {
          size: sizes.map(s => Math.min(80, s * 1.55 + 8)),
          color: displayColors.map(c => c.replace(/[\d.]+\)$/, '0.10)')),
          symbol: CATEGORY_SYMBOLS[category],
          line: { color: 'rgba(0,0,0,0.0)', width: 0 }
        },
        hoverinfo: 'skip',
        showlegend: false
      });

      // Main markers
      traces.push({
        x: xs,
        y: ys,
        mode: showLabels ? 'markers+text' : 'markers',
        text: categoryEntries.map(e => e.label),
        textposition: 'top center',
        textfont: { color: 'rgba(255,255,255,0.88)', size: 10 },
        marker: {
          size: sizes,
          color: displayColors,
          symbol: CATEGORY_SYMBOLS[category],
          line: { 
            color: displayColors.map((_, idx) => {
              const label = categoryEntries[idx].label;
              return dimmedNodes.has(label) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.45)';
            }),
            width: 1.3 
          }
        },
        customdata: categoryEntries.map(e => [e.label, e.category, e.power, e.valence]),
        hovertemplate: '%{customdata[0]}<br>Category: %{customdata[1]}<br>Power: %{customdata[2]:.0%}<br>Valence: %{customdata[3]:+.2f}<extra></extra>',
        name: category,
        showlegend: true
      });
    });

    return { positions, weightedDegrees, traces };
  }, [entries, associations, sizeMetric, radiusMode, showEdges, showLabels, sizeScale, opacity, dimmedNodes]);

  const layout = {
    template: 'none',
    width: 1000,
    height: 900,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 20, r: 20, t: 80, b: 60 },
    title: {
      text: `Self Map — ${entries.length} entries, ${associations.length} associations`,
      x: 0.5,
      xanchor: 'center',
      font: { color: 'rgba(255,255,255,0.95)', size: 24 }
    },
    legend: {
      bgcolor: 'rgba(15,18,32,0.6)',
      font: { color: 'rgba(255,255,255,0.95)', size: 12 },
      orientation: 'h',
      y: 1.03,
      x: 0.5,
      xanchor: 'center'
    },
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: 'rgba(20,22,40,0.98)',
      bordercolor: 'rgba(255,255,255,0.25)',
      font: { color: 'white', size: 12 }
    },
    xaxis: {
      visible: false,
      range: [-R_MAX - 16, R_MAX + 16],
      constrain: 'domain'
    },
    yaxis: {
      visible: false,
      range: [-R_MAX - 16, R_MAX + 16],
      scaleanchor: 'x',
      scaleratio: 1
    }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };

  const handleHover = (event: any) => {
    if (event.points && event.points.length > 0) {
      const point = event.points[0];
      if (point.customdata) {
        const [label] = point.customdata;
        const entry = entries.find(e => e.label === label);
        if (entry) {
          setHoveredEntry(entry);
          
          // Find connected nodes
          const connected = new Set<string>([label]);
          associations.forEach(assoc => {
            if (assoc.src === label) connected.add(assoc.dst);
            if (assoc.dst === label) connected.add(assoc.src);
          });
          
          // Dim all nodes that are NOT connected
          const allLabels = new Set(entries.map(e => e.label));
          const toDim = new Set([...allLabels].filter(l => !connected.has(l)));
          setDimmedNodes(toDim);
          
          // Clear any existing timeout
          if (imageTimeout) {
            clearTimeout(imageTimeout);
          }
          
          // Try to load corresponding image (1-10.jpg based on entry index)
          const entryIndex = entries.indexOf(entry);
          const imageNum = (entryIndex % 10) + 1;
          setHoveredImage(`/imagery/${imageNum}.jpg`);
          setImageError(false);
          
          // Set timeout to hide image after 30 seconds
          const timeout = setTimeout(() => {
            setHoveredImage(null);
            setImageError(false);
          }, 30000);
          setImageTimeout(timeout);
        }
      }
    }
  };

  const handleUnhover = () => {
    setHoveredEntry(null);
    setDimmedNodes(new Set());
    // Don't clear the image immediately - let the timeout handle it
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <HoverInfo entry={hoveredEntry} visible={hoveredEntry !== null} />
      </div>
      
      {hoveredImage && !imageError && (
        <div className="image-preview">
          <img 
            src={hoveredImage}
            alt="Entry visualization"
            className="w-32 h-32 object-cover pulse-glow"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      
      <div className="viz-container relative overflow-visible">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-gradient-to-r from-primary/20 via-transparent to-transparent" />
        </div>
        
        <Plot
          data={traces}
          layout={layout}
          config={config}
          onHover={handleHover}
          onUnhover={handleUnhover}
          className="w-full"
        />
      </div>
    </div>
  );
};
