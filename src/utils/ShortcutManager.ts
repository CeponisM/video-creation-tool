import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCurrentTime } from '../store/slices/timelineSlice';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export const useShortcuts = (initialShortcuts: ShortcutAction[]) => {
  const dispatch = useAppDispatch();
  const [shortcuts, setShortcuts] = useState<ShortcutAction[]>(initialShortcuts);

  const defaultShortcuts: ShortcutAction[] = [
    { key: ' ', action: () => dispatch(setCurrentTime(0)) },
    { 
      key: 'ArrowLeft', 
      action: () => dispatch(setCurrentTime({ type: 'decrement', amount: 1 / 30 }))
    },
    { 
      key: 'ArrowRight', 
      action: () => dispatch(setCurrentTime({ type: 'increment', amount: 1 / 30 }))
    },
  ];

  useEffect(() => {
    const updatedShortcuts = [...shortcuts];
    defaultShortcuts.forEach(shortcut => {
      if (!updatedShortcuts.some(s => s.key === shortcut.key)) {
        updatedShortcuts.push(shortcut);
      }
    });
    setShortcuts(updatedShortcuts);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(
        shortcut =>
          shortcut.key === event.key &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, dispatch]);

  return shortcuts;
};
