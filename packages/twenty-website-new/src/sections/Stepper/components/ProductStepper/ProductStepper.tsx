'use client';

import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { StepperProductStepType } from '@/sections/Stepper/types/StepperProductStep';
import { useMemo, useState } from 'react';
import { ProductContent } from '../ProductContent/ProductContent';
import { ProductVisual } from '../ProductVisual/ProductVisual';
import { Root } from '../Root/Root';

type ProductStepperProps = {
  body: BodyType;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  steps: StepperProductStepType[];
};

export function ProductStepper({
  body,
  eyebrow,
  heading,
  steps,
}: ProductStepperProps) {
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
      <ProductContent
        activeStepIndex={activeStepIndex}
        body={body}
        eyebrow={eyebrow}
        heading={heading}
        onStepSelect={setActiveStepIndex}
        steps={contentSteps}
      />
      <ProductVisual activeStepIndex={activeStepIndex} images={images} />
    </Root>
  );
}
