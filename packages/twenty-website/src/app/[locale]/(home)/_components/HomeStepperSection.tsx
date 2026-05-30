import { msg } from '@lingui/core/macro';

import { Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { HomeStepper, type HomeStepperStepType } from '@/sections/HomeStepper';

export function HomeStepperSection() {
  const i18n = getServerI18n();

  const steps: HomeStepperStepType[] = [
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Begin with production-grade`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`building blocks`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Continue iteration`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`without friction`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Stay in control with our`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`open-source software`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.`,
    },
  ];

  return <HomeStepper.ScrollSection steps={steps} />;
}
