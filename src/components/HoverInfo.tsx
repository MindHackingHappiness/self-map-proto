import { Entry } from '@/types/selfmap';

interface HoverInfoProps {
  entry: Entry | null;
  visible: boolean;
}

export const HoverInfo = ({ entry, visible }: HoverInfoProps) => {
  if (!visible || !entry) return null;

  return (
    <div className="glass-panel p-4 min-w-[250px]">
      <h3 className="text-lg font-semibold mb-3 text-foreground">{entry.label}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Category:</span>
          <span className="font-medium text-foreground">{entry.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Power:</span>
          <span className="font-mono text-foreground">{(entry.power * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valence:</span>
          <span className="font-mono text-foreground">{entry.valence >= 0 ? '+' : ''}{entry.valence.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
