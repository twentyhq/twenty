'use client';

import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';
import { useMemo, useState } from 'react';
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
  const [activeStepIndex, setActiveStepIndex] = useState(0);

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
    <Root>
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        eyebrow={eyebrow}
        heading={heading}
        onStepSelect={setActiveStepIndex}
        steps={contentSteps}
      />
      <Visual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
