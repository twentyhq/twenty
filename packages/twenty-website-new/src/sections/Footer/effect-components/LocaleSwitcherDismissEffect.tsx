'use client';

import { useEffect, type RefObject } from 'react';

type LocaleSwitcherDismissEffectProps = {
  open: boolean;
  onDismiss: () => void;
  wrapperRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  searchRef: RefObject<HTMLInputElement | null>;
  showSearch: boolean;
};

export function LocaleSwitcherDismissEffect({
  open,
  onDismiss,
  wrapperRef,
  triggerRef,
  searchRef,
  showSearch,
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

  useEffect(() => {
    if (open && showSearch) {
      searchRef.current?.focus();
    }
  }, [open, showSearch, searchRef]);

  return null;
}
