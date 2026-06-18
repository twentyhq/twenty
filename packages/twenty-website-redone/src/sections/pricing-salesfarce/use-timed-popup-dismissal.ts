'use client';

import { useEffect, useState } from 'react';

import { WRONG_CHOICE_POPUP } from './wrong-choice-popup-constants';

export function useTimedPopupDismissal(
  isClosingRequested: boolean,
  onClose: () => void,
) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setIsClosing(true),
      WRONG_CHOICE_POPUP.visibleDurationMs,
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClosingRequested) {
      setIsClosing(true);
    }
  }, [isClosingRequested]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }
    const timer = setTimeout(onClose, WRONG_CHOICE_POPUP.fadeDurationMs);
    return () => clearTimeout(timer);
  }, [isClosing, onClose]);

  return isClosing;
}
