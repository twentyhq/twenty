'use client';

import {
  HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES,
  scrollProgressToHomeStepperLottieFrame,
} from '@/sections/HomeStepper/utils/home-stepper-lottie-frame-map';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const HOME_STEPPER_LOTTIE_SRC = '/images/home/stepper/lottie.json';

const LottieSlot = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: ${theme.spacing(4)};
  padding-left: ${theme.spacing(8)};
  pointer-events: none;
  width: 100%;
`;

type LottieAnimationData = {
  fr?: number;
  ip?: number;
  op?: number;
} & Record<string, unknown>;

type StepperLottieProps = {
  scrollProgress: number;
};

function lottieTotalFrameCount(animationData: LottieAnimationData): number {
  const op = typeof animationData.op === 'number' ? animationData.op : 0;
  const ip = typeof animationData.ip === 'number' ? animationData.ip : 0;
  const span = op - ip;
  const rounded = Math.round(span);
  if (rounded >= 1) {
    return rounded;
  }
  return HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES;
}

function applyScrollToLottie(
  lottieApi: LottieRefCurrentProps | null,
  scrollProgress: number,
  totalFrames: number,
) {
  if (!lottieApi?.animationLoaded) {
    return;
  }
  const frame = scrollProgressToHomeStepperLottieFrame(
    scrollProgress,
    totalFrames,
  );
  lottieApi.goToAndStop(frame, true);
}

export function StepperLottie({ scrollProgress }: StepperLottieProps) {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    null,
  );
  const [totalFrames, setTotalFrames] = useState(
    HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES,
  );
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;
  const totalFramesRef = useRef(totalFrames);
  totalFramesRef.current = totalFrames;

  useEffect(() => {
    const controller = new AbortController();

    fetch(HOME_STEPPER_LOTTIE_SRC, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Lottie fetch failed: ${response.status}`);
        }
        return response.json() as Promise<LottieAnimationData>;
      })
      .then((data) => {
        const parsed = data as LottieAnimationData;
        setAnimationData(parsed);
        setTotalFrames(lottieTotalFrameCount(parsed));
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setAnimationData(null);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useLayoutEffect(() => {
    if (!animationData) {
      return;
    }
    applyScrollToLottie(lottieRef.current, scrollProgress, totalFrames);
  }, [animationData, scrollProgress, totalFrames]);

  if (!animationData) {
    return <LottieSlot aria-hidden />;
  }

  return (
    <LottieSlot aria-hidden>
      <Lottie
        animationData={animationData}
        autoplay={false}
        loop={false}
        lottieRef={lottieRef}
        style={{ height: '100%', maxWidth: '100%', width: '100%' }}
        onDOMLoaded={() => {
          lottieRef.current?.setSubframe(true);
          applyScrollToLottie(
            lottieRef.current,
            scrollProgressRef.current,
            totalFramesRef.current,
          );
        }}
      />
    </LottieSlot>
  );
}
