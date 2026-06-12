'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { DotLottie } from '@lottiefiles/dotlottie-react';

import { scrollProgressToHomeStepperLottieFrame } from '@/sections/HomeStepper/utils/home-stepper-lottie-frame-map';

const HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES = 1439;

function applyScrollToDotLottie(
  dotLottie: DotLottie | null,
  scrollProgress: number,
  totalFrames: number,
) {
  if (!dotLottie?.isLoaded || totalFrames <= 0) {
    return;
  }
  const frame = scrollProgressToHomeStepperLottieFrame(
    scrollProgress,
    totalFrames,
  );
  dotLottie.setFrame(frame);
}

export function useDotLottieScrollSync(scrollProgress: number) {
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;

  const dotLottieRefCallback = useCallback((instance: DotLottie | null) => {
    setPlayer(instance);
  }, []);

  useEffect(() => {
    if (!player) {
      setTotalFrames(0);
      return;
    }

    const onReady = () => {
      const frames = Math.floor(player.totalFrames);
      if (frames > 0 && frames !== HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES) {
        console.error(
          `[StepperLottie] Lottie totalFrames mismatch — expected ${HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES}, got ${frames} (raw player.totalFrames=${player.totalFrames}). ` +
            'The scroll → frame mapping in home-stepper-lottie-frame-map.ts is tied to the authored timeline; ' +
            'update HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES and the STEP_*_END constants together.',
        );
      }
      setTotalFrames(frames);
      applyScrollToDotLottie(player, scrollProgressRef.current, frames);
    };

    if (player.isLoaded) {
      onReady();
      return;
    }

    player.addEventListener('load', onReady);
    return () => {
      player.removeEventListener('load', onReady);
    };
  }, [player]);

  useEffect(() => {
    applyScrollToDotLottie(player, scrollProgress, totalFrames);
  }, [player, scrollProgress, totalFrames]);

  return dotLottieRefCallback;
}
