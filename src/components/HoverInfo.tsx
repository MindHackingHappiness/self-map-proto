import { Entry } from '@/types/selfmap';

interface HoverInfoProps {
  entry: Entry | null;
  visible: boolean;
}

// Category color mapping for badges
const CATEGORY_COLORS: Record<string, string> = {
  'People': 'hsl(280, 70%, 60%)',
  'Accomplishments': 'hsl(45, 95%, 60%)',
  'Life Story': 'hsl(200, 75%, 55%)',
  'Ideas/Likes': 'hsl(140, 70%, 55%)',
  'Other': 'hsl(0, 0%, 62%)'
};

export const HoverInfo = ({ entry, visible }: HoverInfoProps) => {
  if (!visible || !entry) return null;

  const categoryColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Other'];

  return (
    <div className="glass-panel p-4 min-w-[250px] animate-in fade-in slide-in-from-right-2 duration-200">
      <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
        <span 
          className="w-3 h-3 rounded-full pulse-glow"
          style={{ backgroundColor: categoryColor }}
        />
        {entry.label}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Category:</span>
          <span 
            className="font-medium px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${categoryColor}20`,
              color: categoryColor
            }}
          >
            {entry.category}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Power:</span>
          <span className="font-mono text-foreground font-semibold">{(entry.power * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valence:</span>
          <span 
            className="font-mono font-semibold"
            style={{ color: entry.valence >= 0 ? 'hsl(140, 70%, 60%)' : 'hsl(0, 84%, 65%)' }}
          >
            {entry.valence >= 0 ? '+' : ''}{entry.valence.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
