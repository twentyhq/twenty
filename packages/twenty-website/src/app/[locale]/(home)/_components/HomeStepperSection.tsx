import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { Heading, HeadingPart } from '@/design-system/components';
import {
  HomeStepperScrollSection,
  type HomeStepperStepType,
} from '@/sections/HomeStepper';

export function HomeStepperSection() {
  const steps: HomeStepperStepType[] = [
    {
      heading: (
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">
              Begin with production-grade
            </HeadingPart>
            <HeadingPart fontFamily="sans">building blocks</HeadingPart>
          </Trans>
        </Heading>
      ),
      body: msg`Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">Continue iteration</HeadingPart>
            <HeadingPart fontFamily="sans">without friction</HeadingPart>
          </Trans>
        </Heading>
      ),
      body: msg`Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">
              Stay in control with our
            </HeadingPart>
            <HeadingPart fontFamily="sans">open-source software</HeadingPart>
          </Trans>
        </Heading>
      ),
      body: msg`Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.`,
    },
  ];

  return <HomeStepperScrollSection steps={steps} />;
}
