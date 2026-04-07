'use client';

import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { SyncScrollProgressFromContainerEffect } from '@/sections/ProductStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';
import { useMemo, useRef, useState } from 'react';
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.floor(scrollProgress * steps.length),
  );
  const localProgress =
    scrollProgress * steps.length - activeStepIndex;

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
      <SyncScrollProgressFromContainerEffect
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        eyebrow={eyebrow}
        heading={heading}
        localProgress={localProgress}
        steps={contentSteps}
      />
      <Visual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
