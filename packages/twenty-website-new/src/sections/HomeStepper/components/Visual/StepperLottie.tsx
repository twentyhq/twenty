'use client';

import { scrollProgressToHomeStepperLottieFrame } from '@/sections/HomeStepper/utils/home-stepper-lottie-frame-map';
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

type LottieAnimationData = Record<string, unknown>;

type StepperLottieProps = {
  scrollProgress: number;
};

function applyScrollToLottie(
  lottieApi: LottieRefCurrentProps | null,
  scrollProgress: number,
) {
  if (!lottieApi?.animationLoaded) {
    return;
  }
  const frame = scrollProgressToHomeStepperLottieFrame(scrollProgress);
  lottieApi.goToAndStop(frame, true);
}

export function StepperLottie({ scrollProgress }: StepperLottieProps) {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    null,
  );
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;

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
        setAnimationData(data);
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
    applyScrollToLottie(lottieRef.current, scrollProgress);
  }, [animationData, scrollProgress]);

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
          applyScrollToLottie(lottieRef.current, scrollProgressRef.current);
        }}
      />
    </LottieSlot>
  );
}
