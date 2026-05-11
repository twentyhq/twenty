import { useEffect, useRef } from 'react';

import { createAnimationFrameLoop } from '@/lib/animation';
import { getPrefersReducedMotionSnapshot } from '@/lib/motion';

import { scrollConversationElementToBottom } from '../utils/conversation-scroll';

const getSafePrefersReducedMotionSnapshot = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? getPrefersReducedMotionSnapshot()
    : true;

export const useConversationAutoScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return undefined;
    }

    const scrollTask = createAnimationFrameLoop({
      onFrame: () => {
        scrollConversationElementToBottom({
          element,
          prefersReducedMotion: getSafePrefersReducedMotionSnapshot(),
        });

        return false;
      },
    });
    const scheduleScroll = scrollTask.start;

    scheduleScroll();

    if (typeof MutationObserver === 'undefined') {
      return () => {
        scrollTask.stop();
      };
    }

    const observer = new MutationObserver(scheduleScroll);

    observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      scrollTask.stop();
    };
  }, []);

  return scrollRef;
};
