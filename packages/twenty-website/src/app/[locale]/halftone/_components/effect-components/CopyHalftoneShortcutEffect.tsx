'use client';

import { useEffect } from 'react';

function isEditablePasteTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.closest('[contenteditable=""], [contenteditable="true"]') !== null
  );
}

function hasTextSelection() {
  const selection = window.getSelection();

  return selection !== null && selection.toString().trim().length > 0;
}

type CopyHalftoneShortcutEffectProps = {
  canvasLayerRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (width: number, height: number) => void;
};

export function CopyHalftoneShortcutEffect({
  canvasLayerRef,
  onCopy,
}: CopyHalftoneShortcutEffectProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCopyShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'c';

      if (!isCopyShortcut) {
        return;
      }

      if (isEditablePasteTarget(event.target) || hasTextSelection()) {
        return;
      }

      const canvasLayer = canvasLayerRef.current;
      const width = Math.max(canvasLayer?.clientWidth ?? 0, 1);
      const height = Math.max(canvasLayer?.clientHeight ?? 0, 1);

      event.preventDefault();
      onCopy(width, height);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasLayerRef, onCopy]);

  return null;
}
