'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

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

export function StepperLottie() {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    fetch(HOME_STEPPER_LOTTIE_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Lottie fetch failed: ${response.status}`);
        }
        return response.json() as Promise<LottieAnimationData>;
      })
      .then((data) => {
        if (!cancelled) {
          setAnimationData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnimationData(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) {
    return <LottieSlot aria-hidden />;
  }

  return (
    <LottieSlot aria-hidden>
      <Lottie
        animationData={animationData}
        loop
        style={{ height: '100%', maxWidth: '100%', width: '100%' }}
      />
    </LottieSlot>
  );
}
