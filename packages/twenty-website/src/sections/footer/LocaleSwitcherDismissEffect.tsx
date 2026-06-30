'use client';

import { useEffect, type RefObject } from 'react';

export type LocaleSwitcherDismissEffectProps = {
  open: boolean;
  onDismiss: () => void;
  wrapperRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function LocaleSwitcherDismissEffect({
  open,
  onDismiss,
  wrapperRef,
  triggerRef,
}: LocaleSwitcherDismissEffectProps) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onDismiss, wrapperRef, triggerRef]);

  return null;
}
