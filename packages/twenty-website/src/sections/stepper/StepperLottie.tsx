'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

import { useDotLottieScrollSync } from './use-dot-lottie-scroll-sync';

const LOTTIE_SRC = '/lottie/stepper/stepper.lottie';

const LottieSlot = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: ${spacing(4)};
  padding-left: ${spacing(8)};
  pointer-events: none;
  width: 100%;
`;

export function StepperLottie({ scrollProgress }: { scrollProgress: number }) {
  const playerRefCallback = useDotLottieScrollSync(scrollProgress);

  return (
    <LottieSlot aria-hidden>
      <DotLottieReact
        autoplay={false}
        dotLottieRefCallback={playerRefCallback}
        layout={{ align: [0.5, 0.5], fit: 'contain' }}
        loop={false}
        src={LOTTIE_SRC}
        style={{ height: '100%', maxWidth: '100%', width: '100%' }}
        useFrameInterpolation
      />
    </LottieSlot>
  );
}
