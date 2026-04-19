'use client';

import { styled } from '@linaria/react';
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { scrollProgressToHomeStepperLottieFrame } from '@/sections/HomeStepper/utils/home-stepper-lottie-frame-map';
import { theme } from '@/theme';

export const HOME_STEPPER_LOTTIE_SRC =
  '/lottie/stepper/stepper.lottie?v=data-model-icon-white-4-logic-outline';

const LottieSlot = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: ${theme.spacing(4)};
  padding-left: ${theme.spacing(8)};
  pointer-events: none;
  width: 100%;
`;

type StepperLottieProps = {
  scrollProgress: number;
};

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

export function StepperLottie({ scrollProgress }: StepperLottieProps) {
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
      const frames = player.totalFrames;
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

  useLayoutEffect(() => {
    applyScrollToDotLottie(player, scrollProgress, totalFrames);
  }, [player, scrollProgress, totalFrames]);

  return (
    <LottieSlot aria-hidden>
      <DotLottieReact
        autoplay={false}
        dotLottieRefCallback={dotLottieRefCallback}
        layout={{ align: [0.5, 0.5], fit: 'contain' }}
        loop={false}
        src={HOME_STEPPER_LOTTIE_SRC}
        style={{ height: '100%', maxWidth: '100%', width: '100%' }}
        useFrameInterpolation
      />
    </LottieSlot>
  );
}
