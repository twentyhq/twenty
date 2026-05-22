'use client';

import { useEffect, type RefObject } from 'react';

type TooltipPositionEffectProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  setTooltipPosition: (position: { left: number; top: number }) => void;
};

export function TooltipPositionEffect({
  buttonRef,
  isOpen,
  setTooltipPosition,
}: TooltipPositionEffectProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateTooltipPosition = () => {
      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      setTooltipPosition({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 12,
      });
    };

    updateTooltipPosition();

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [isOpen, buttonRef, setTooltipPosition]);

  return null;
}
