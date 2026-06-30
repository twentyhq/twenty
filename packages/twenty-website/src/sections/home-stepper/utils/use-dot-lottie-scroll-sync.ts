'use client';

import { type DotLottie } from '@lottiefiles/dotlottie-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { LOTTIE_FRAME_MAP } from './lottie-frame-map';

const applyScrollToPlayer = (
  player: DotLottie | null,
  scrollProgress: number,
  totalFrames: number,
) => {
  if (!player?.isLoaded || totalFrames <= 0) return;
  player.setFrame(LOTTIE_FRAME_MAP.toFrame(scrollProgress, totalFrames));
};

export function useDotLottieScrollSync(scrollProgress: number) {
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;

  const playerRefCallback = useCallback((instance: DotLottie | null) => {
    setPlayer(instance);
  }, []);

  useEffect(() => {
    if (!player) {
      setTotalFrames(0);
      return;
    }
    const onReady = () => {
      const frames = Math.floor(player.totalFrames);
      if (frames > 0 && frames !== LOTTIE_FRAME_MAP.expectedTotalFrames) {
        console.error(
          `Stepper lottie totalFrames mismatch: expected ${LOTTIE_FRAME_MAP.expectedTotalFrames}, got ${frames}. ` +
            'Update lottie-frame-map.ts together with the asset.',
        );
      }
      setTotalFrames(frames);
      applyScrollToPlayer(player, scrollProgressRef.current, frames);
    };
    if (player.isLoaded) {
      onReady();
      return;
    }
    player.addEventListener('load', onReady);
    return () => player.removeEventListener('load', onReady);
  }, [player]);

  useEffect(() => {
    applyScrollToPlayer(player, scrollProgress, totalFrames);
  }, [player, scrollProgress, totalFrames]);

  return playerRefCallback;
}
