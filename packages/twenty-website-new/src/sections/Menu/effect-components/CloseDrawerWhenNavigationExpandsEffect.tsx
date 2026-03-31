"use client";

import { useEffect } from "react";
import { theme } from "@/theme";

interface CloseDrawerWhenNavigationExpandsEffectProps {
  onClose: () => void;
}

/**
 * Subscribes to viewport changes and calls onClose whenever the layout
 * crosses into the desktop breakpoint, so the drawer closes when the full
 * navigation is shown.
 */
export function CloseDrawerWhenNavigationExpandsEffect({
  onClose,
}: CloseDrawerWhenNavigationExpandsEffectProps) {
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${theme.breakpoints.md}px)`);

    const handleChange = () => {
      if (mediaQuery.matches) onClose();
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [onClose]);

  return null;
}
