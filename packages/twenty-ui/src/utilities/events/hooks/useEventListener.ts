import { useEffect } from 'react';

export const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | Document | HTMLElement | null,
) => {
  useEffect(() => {
    const target =
      element ?? (typeof window !== 'undefined' ? window : undefined);

    if (!target) return;

    const listener = (event: Event) => {
      handler(event as WindowEventMap[K]);
    };

    target.addEventListener(eventName, listener);

    return () => {
      target.removeEventListener(eventName, listener);
    };
  }, [eventName, handler, element]);
};
