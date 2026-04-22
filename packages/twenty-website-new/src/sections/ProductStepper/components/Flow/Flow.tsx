'use client';

import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { useStepperMdUp } from '@/lib/stepper';
import { SyncScrollProgressFromContainerEffect } from '@/sections/ProductStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';
import { Visual } from '../Visual/Visual';

type FlowProps = {
  body: BodyType;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  steps: ProductStepperStepType[];
};

export function Flow({ body, eyebrow, heading, steps }: FlowProps) {
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
      {isMdUp ? (
        <SyncScrollProgressFromContainerEffect
          onScrollProgress={setScrollProgress}
          scrollContainerRef={scrollContainerRef}
        />
      ) : null}
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        eyebrow={eyebrow}
        heading={heading}
        layoutMode={isMdUp ? 'scroll' : 'swipe'}
        localProgress={localProgress}
        onMobileStepIndexChange={setMobileStepIndex}
        steps={contentSteps}
      />
      <Visual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
