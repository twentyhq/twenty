'use client';

import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import { ScrollProgressEffect } from '@/lib/scroll';
import { useStepperMdUp } from '@/lib/stepper';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Content } from './Content';
import { Root } from './Root';
import { Visual } from './Visual';

type FlowProps = {
  body: MessageBody;
  children: ReactNode;
  eyebrow: MessageEyebrow;
  steps: ProductStepperStepType[];
};

export function Flow({ body, children, eyebrow, steps }: FlowProps) {
  const isMdUp = useStepperMdUp();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileStepIndex, setMobileStepIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const previousMdUpRef = useRef(isMdUp);

  useEffect(() => {
    if (previousMdUpRef.current && !isMdUp) {
      const scrollDerivedIndex = Math.min(
        steps.length - 1,
        Math.floor(scrollProgress * steps.length),
      );
      setMobileStepIndex(scrollDerivedIndex);
    }
    previousMdUpRef.current = isMdUp;
  }, [isMdUp, scrollProgress, steps.length]);

  const activeStepIndex = isMdUp
    ? Math.min(steps.length - 1, Math.floor(scrollProgress * steps.length))
    : mobileStepIndex;

  const localProgress = isMdUp
    ? scrollProgress * steps.length - activeStepIndex
    : 0;

  const contentSteps = useMemo(
    () =>
      steps.map(({ body: stepBody, heading: stepHeading, icon }) => ({
        body: stepBody,
        heading: stepHeading,
        icon,
      })),
    [steps],
  );

  const images = useMemo(() => steps.map((step) => step.image), [steps]);

  return (
    <Root scrollContainerRef={scrollContainerRef}>
      <ScrollProgressEffect
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
        enabled={isMdUp}
      />
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        heading={children}
        eyebrow={eyebrow}
        layoutMode={isMdUp ? 'scroll' : 'swipe'}
        localProgress={localProgress}
        onMobileStepIndexChange={setMobileStepIndex}
        steps={contentSteps}
      />
      <Visual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
