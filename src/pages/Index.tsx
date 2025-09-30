import { useState } from 'react';
import { SelfMapVisualization } from '@/components/SelfMapVisualization';
import { ControlPanel } from '@/components/ControlPanel';
import { SelfMapData, SizeMetric, RadiusMode } from '@/types/selfmap';
import { DEFAULT_DATA } from '@/data/defaultData';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<SelfMapData>(DEFAULT_DATA);
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('power_x_val');
  const [radiusMode, setRadiusMode] = useState<RadiusMode>('valence');
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [sizeScale, setSizeScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.88);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        if (!json.entries || !Array.isArray(json.entries)) {
          throw new Error('Invalid JSON format: missing entries array');
        }

        setData({
          entries: json.entries,
          associations: json.associations || []
        });

        toast.success(`Loaded ${json.entries.length} entries and ${(json.associations || []).length} associations`);
      } catch (error) {
        toast.error('Failed to parse JSON file');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setData(DEFAULT_DATA);
    toast.success('Sample data loaded');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">VizBoot</h1>
                <p className="text-sm text-muted-foreground">Self Map Radial Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Control Panel */}
          <aside>
            <ControlPanel
              sizeMetric={sizeMetric}
              onSizeMetricChange={setSizeMetric}
              radiusMode={radiusMode}
              onRadiusModeChange={setRadiusMode}
              showEdges={showEdges}
              onShowEdgesChange={setShowEdges}
              showLabels={showLabels}
              onShowLabelsChange={setShowLabels}
              sizeScale={sizeScale}
              onSizeScaleChange={setSizeScale}
              opacity={opacity}
              onOpacityChange={setOpacity}
              onFileUpload={handleFileUpload}
              onLoadSample={handleLoadSample}
            />
          </aside>

          {/* Visualization */}
          <div className="glass-panel p-6">
            <SelfMapVisualization
              entries={data.entries}
              associations={data.associations}
              sizeMetric={sizeMetric}
              radiusMode={radiusMode}
              showEdges={showEdges}
              showLabels={showLabels}
              sizeScale={sizeScale}
              opacity={opacity}
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Radius: {radiusMode === 'valence' ? 'Valence (outer=negative)' : 'Power (outer=low power)'}</p>
              <p>Size: {sizeMetric.replace(/_/g, ' ')} • Hover for details • Drag to pan • Scroll to zoom</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">About Self Map Visualization</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Features</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Radial positioning by valence or power</li>
                <li>Color-coded by emotional valence</li>
                <li>Interactive size metrics</li>
                <li>Relationship edges (affirms, threatens, associates)</li>
                <li>Category-based organization</li>
                <li>Live controls and hover effects</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">JSON Format</h3>
              <pre className="bg-secondary/50 p-3 rounded text-xs overflow-x-auto">
{`{
  "entries": [
    {
      "label": "Partner",
      "category": "People",
      "power": 0.96,
      "valence": 0.90
    }
  ],
  "associations": [
    {
      "src": "Work",
      "dst": "Finance",
      "relation": "affirms",
      "weight": 0.8
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
