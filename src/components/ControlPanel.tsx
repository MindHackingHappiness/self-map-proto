import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SizeMetric, RadiusMode } from '@/types/selfmap';
import { Upload } from 'lucide-react';

interface ControlPanelProps {
  sizeMetric: SizeMetric;
  onSizeMetricChange: (metric: SizeMetric) => void;
  radiusMode: RadiusMode;
  onRadiusModeChange: (mode: RadiusMode) => void;
  showEdges: boolean;
  onShowEdgesChange: (show: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  sizeScale: number;
  onSizeScaleChange: (scale: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
}

export const ControlPanel = ({
  sizeMetric,
  onSizeMetricChange,
  radiusMode,
  onRadiusModeChange,
  showEdges,
  onShowEdgesChange,
  showLabels,
  onShowLabelsChange,
  sizeScale,
  onSizeScaleChange,
  opacity,
  onOpacityChange,
  onFileUpload,
  onLoadSample
}: ControlPanelProps) => {
  const sizeMetrics: Array<{ label: string; value: SizeMetric }> = [
    { label: 'Power × |Valence|', value: 'power_x_val' },
    { label: 'Power', value: 'power' },
    { label: '|Valence|', value: 'valence_abs' },
    { label: 'Weighted Degree', value: 'weighted_degree' }
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Data Source</h3>
        <div className="flex gap-2">
          <Button
            onClick={onLoadSample}
            variant="secondary"
            className="flex-1"
          >
            Load Sample
          </Button>
          <label className="flex-1">
            <input
              type="file"
              accept=".json"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button variant="secondary" className="w-full" asChild>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload JSON
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Size Metric</h3>
        <div className="grid grid-cols-2 gap-2">
          {sizeMetrics.map((metric) => (
            <Button
              key={metric.value}
              onClick={() => onSizeMetricChange(metric.value)}
              variant={sizeMetric === metric.value ? 'default' : 'secondary'}
              size="sm"
              className="text-xs"
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Radius Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onRadiusModeChange('valence')}
            variant={radiusMode === 'valence' ? 'default' : 'secondary'}
            size="sm"
          >
            Valence
          </Button>
          <Button
            onClick={() => onRadiusModeChange('power')}
            variant={radiusMode === 'power' ? 'default' : 'secondary'}
            size="sm"
          >
            Power
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Display Options</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onShowEdgesChange(!showEdges)}
            variant={showEdges ? 'default' : 'secondary'}
            size="sm"
          >
            {showEdges ? 'Hide' : 'Show'} Edges
          </Button>
          <Button
            onClick={() => onShowLabelsChange(!showLabels)}
            variant={showLabels ? 'default' : 'secondary'}
            size="sm"
          >
            {showLabels ? 'Hide' : 'Show'} Labels
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm text-muted-foreground">Size Scale</Label>
            <span className="text-sm font-mono text-foreground">{sizeScale.toFixed(2)}</span>
          </div>
          <Slider
            value={[sizeScale]}
            onValueChange={(values) => onSizeScaleChange(values[0])}
            min={0.6}
            max={1.8}
            step={0.05}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm text-muted-foreground">Opacity</Label>
            <span className="text-sm font-mono text-foreground">{opacity.toFixed(2)}</span>
          </div>
          <Slider
            value={[opacity]}
            onValueChange={(values) => onOpacityChange(values[0])}
            min={0.35}
            max={1.0}
            step={0.05}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
