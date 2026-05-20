'use client';

import { styled } from '@linaria/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { theme } from '@/theme';

import { useDotLottieScrollSync } from './use-dot-lottie-scroll-sync';

const HOME_STEPPER_LOTTIE_SRC =
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

export function StepperLottie({ scrollProgress }: StepperLottieProps) {
  const dotLottieRefCallback = useDotLottieScrollSync(scrollProgress);

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
