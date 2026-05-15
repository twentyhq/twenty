import { type RefObject, useEffect, useState } from 'react';

const SCENE_COUNT = 4;

type ScrollProgress = {
  progress: number;
  sceneIndex: number;
};

export function useHeroScrollProgress(
  trackRef: RefObject<HTMLDivElement | null>,
): ScrollProgress {
  const [state, setState] = useState<ScrollProgress>({
    progress: 0,
    sceneIndex: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const element = trackRef.current;

      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollableDistance = element.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      const nextScene = Math.min(
        SCENE_COUNT - 1,
        Math.floor(progress * SCENE_COUNT),
      );

      setState({ progress, sceneIndex: nextScene });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackRef]);

  return state;
}
