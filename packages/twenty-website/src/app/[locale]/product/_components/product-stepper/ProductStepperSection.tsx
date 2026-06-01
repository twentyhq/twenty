import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { Flow } from './Flow';
import type { ProductStepperStepType } from './types';
import { DataModelVisual } from './visuals/DataModelVisual';
import { LayoutVisual } from './visuals/LayoutVisual';
import { WorkflowVisual } from './visuals/WorkflowVisual';

export function ProductStepperSection() {
  const i18n = getServerI18n();

  const steps: ProductStepperStepType[] = [
    {
      icon: 'users',
      heading: (
        <HeadingPart fontFamily="sans">
          <Trans>Data model</Trans>
        </HeadingPart>
      ),
      body: msg`Add objects and fields`,
      visual: DataModelVisual,
    },
    {
      icon: 'check',
      heading: (
        <HeadingPart fontFamily="sans">
          <Trans>Automation</Trans>
        </HeadingPart>
      ),
      body: msg`Create a workflow`,
      visual: WorkflowVisual,
    },
    {
      icon: 'eye',
      heading: (
        <HeadingPart fontFamily="sans">
          <Trans>Layout</Trans>
        </HeadingPart>
      ),
      body: msg`Tailor record pages, menus, and views`,
      visual: LayoutVisual,
    },
  ];

  return (
    <Flow
      body={i18n._(
        msg`Need a quick change? Skip the engineering ticket. Customize your workspace in minutes.`,
      )}
      eyebrow={i18n._(msg`Customization`)}
      steps={steps}
    >
      <Trans>
        <HeadingPart fontFamily="serif">Go the extra mile</HeadingPart>
        <HeadingPart fontFamily="sans">with no-code</HeadingPart>
      </Trans>
    </Flow>
  );
}
