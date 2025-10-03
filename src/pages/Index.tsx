import { useState, useMemo, useCallback } from 'react';
import { SelfMapVisualization } from '@/components/SelfMapVisualization';
import { ControlPanel } from '@/components/ControlPanel';
import { KeyboardShortcuts, useKeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { SelfMapData, SizeMetric, RadiusMode, Entry } from '@/types/selfmap';
import { DEFAULT_DATA } from '@/data/defaultData';
import { toast } from 'sonner';
import { Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [data, setData] = useState<SelfMapData>(DEFAULT_DATA);
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('power_x_val');
  const [radiusMode, setRadiusMode] = useState<RadiusMode>('valence');
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [sizeScale, setSizeScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.88);
  const [pulsationMode, setPulsationMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>(['People', 'Accomplishments', 'Life Story', 'Ideas/Likes', 'Other']);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Filter entries based on search and categories
  const filteredEntries = useMemo(() => {
    return data.entries.filter((entry) => {
      // Category filter
      if (!filterCategories.includes(entry.category)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return entry.label.toLowerCase().includes(query) ||
               entry.category.toLowerCase().includes(query);
      }

      return true;
    });
  }, [data.entries, filterCategories, searchQuery]);

  // Handle node click
  const handleNodeClick = useCallback((entry: Entry) => {
    // Toggle highlighting
    if (highlightedNodes.includes(entry.label)) {
      setHighlightedNodes(prev => prev.filter(node => node !== entry.label));
    } else {
      setHighlightedNodes(prev => [...prev, entry.label]);
    }
  }, [highlightedNodes]);

  // Handle node double-click (placeholder for future enhancement)
  const handleNodeDoubleClick = useCallback((entry: Entry) => {
    toast.info(`Double-clicked: ${entry.label}`);
    // Future: could open a detailed view or perform an action
  }, []);

  // Keyboard shortcut handlers
  useKeyboardShortcuts({
    'escape': () => {
      setHighlightedNodes([]);
      setSearchQuery('');
    },
    ' ': () => setPulsationMode(prev => !prev),
    'l': () => setShowLabels(prev => !prev),
    'e': () => setShowEdges(prev => !prev),
    '+': () => setSizeScale(prev => Math.min(prev + 0.1, 2.5)),
    '-': () => setSizeScale(prev => Math.max(prev - 0.1, 0.3)),
    '[': () => setOpacity(prev => Math.max(prev - 0.05, 0.2)),
    ']': () => setOpacity(prev => Math.min(prev + 0.05, 1.0)),
    '1': () => toggleCategory('People'),
    '2': () => toggleCategory('Accomplishments'),
    '3': () => toggleCategory('Life Story'),
    '4': () => toggleCategory('Ideas/Likes'),
    '5': () => toggleCategory('Other'),
    '?': () => setShowShortcuts(true),
  });

  // Category toggle helper
  const toggleCategory = useCallback((category: string) => {
    setFilterCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategories(['People', 'Accomplishments', 'Life Story', 'Ideas/Likes', 'Other']);
    setHighlightedNodes([]);
  }, []);

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
              pulsationMode={pulsationMode}
              onPulsationModeChange={setPulsationMode}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              filterCategories={filterCategories}
              onFilterCategoriesChange={setFilterCategories}
              onFileUpload={handleFileUpload}
              onLoadSample={handleLoadSample}
            />
            {/* Help Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="w-full"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Keyboard Shortcuts
              </Button>
            </div>
          </aside>

          {/* Visualization */}
          <div className="glass-panel p-6">
            <SelfMapVisualization
              entries={filteredEntries}
              associations={data.associations}
              sizeMetric={sizeMetric}
              radiusMode={radiusMode}
              showEdges={showEdges}
              showLabels={showLabels}
              sizeScale={sizeScale}
              opacity={opacity}
              pulsationMode={pulsationMode}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              highlightedNodes={highlightedNodes}
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

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </div>
  );
};

export default Index;
