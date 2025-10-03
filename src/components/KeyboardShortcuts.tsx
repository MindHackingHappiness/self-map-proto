import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ['ESC'], description: 'Clear selection and filters' },
  { keys: ['Ctrl', 'S'], description: 'Save current snapshot' },
  { keys: ['Ctrl', 'E'], description: 'Export data as JSON' },
  { keys: ['Ctrl', 'Shift', 'E'], description: 'Export as image' },
  { keys: ['Ctrl', 'R'], description: 'Generate analysis report' },
  { keys: ['Space'], description: 'Toggle pulsation mode' },
  { keys: ['L'], description: 'Toggle labels' },
  { keys: ['E'], description: 'Toggle edges' },
  { keys: ['+'], description: 'Increase size scale' },
  { keys: ['-'], description: 'Decrease size scale' },
  { keys: ['['], description: 'Decrease opacity' },
  { keys: ['\''], description: 'Increase opacity' },
  { keys: ['1-5'], description: 'Toggle category filters' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Click'], description: 'Select node' },
  { keys: ['Double-click'], description: 'View node details' },
  { keys: ['Hover'], description: 'Show connections' },
  { keys: ['Drag'], description: 'Pan the visualization' },
  { keys: ['Scroll'], description: 'Zoom in/out' },
];

export const KeyboardShortcuts = ({ open, onOpenChange }: KeyboardShortcutsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions to enhance your workflow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-muted-foreground flex-1">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {shortcut.keys.map((key, keyIdx) => (
                  <span key={keyIdx}>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent text-xs font-mono">{key}</span>
                    {keyIdx < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-xs text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for keyboard shortcuts management
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Build key combination string
      let keyCombo = '';
      if (ctrl) keyCombo += 'ctrl+';
      if (shift) keyCombo += 'shift+';
      keyCombo += key;

      if (handlers[keyCombo]) {
        e.preventDefault();
        handlers[keyCombo]();
      } else if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}
