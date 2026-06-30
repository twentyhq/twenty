'use client';

import { useEffect, useRef } from 'react';

import {
  createAnimationFrameLoop,
  getReducedMotionSnapshot,
} from '@/platform/motion';

import { scrollConversationElementToBottom } from './conversation-scroll';

const getSafeReducedMotionSnapshot = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? getReducedMotionSnapshot()
    : true;

export const useConversationAutoScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;

    if (element === null) {
      return undefined;
    }

    const scrollTask = createAnimationFrameLoop({
      onFrame: () => {
        scrollConversationElementToBottom({
          element,
          prefersReducedMotion: getSafeReducedMotionSnapshot(),
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
