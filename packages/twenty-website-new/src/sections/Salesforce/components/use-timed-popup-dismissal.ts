'use client';

import { useEffect, useState } from 'react';

import { useTimeoutRegistry } from '@/lib/react';

const POPUP_VISIBLE_DURATION_MS = 3000;
const POPUP_FADE_DURATION_MS = 240;

export function useTimedPopupDismissal(
  isClosingRequested: boolean,
  onClose: () => void,
) {
  const timeoutRegistry = useTimeoutRegistry();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    return timeoutRegistry.schedule(() => {
      setIsClosing(true);
    }, POPUP_VISIBLE_DURATION_MS);
  }, [timeoutRegistry]);

  useEffect(() => {
    if (isClosingRequested) {
      setIsClosing(true);
    }
  }, [isClosingRequested]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    return timeoutRegistry.schedule(() => {
      onClose();
    }, POPUP_FADE_DURATION_MS);
  }, [isClosing, onClose, timeoutRegistry]);

  return isClosing;
}
