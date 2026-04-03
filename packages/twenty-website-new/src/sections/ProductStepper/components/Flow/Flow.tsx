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

  const globalProgress = scrollProgress * (steps.length - 1);
  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor(globalProgress)),
  );

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
        scrollProgress={scrollProgress}
        steps={contentSteps}
      />
      <Visual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
