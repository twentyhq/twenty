import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { msg } from '@lingui/core/macro';

import { Flow } from './Flow';
import type { ProductStepperStepType } from './types';
import { DataModelVisual } from './visuals/DataModelVisual';
import { LayoutVisual } from './visuals/LayoutVisual';
import { WorkflowVisual } from './visuals/WorkflowVisual';

// The product page's "no-code customization" stepper. Owns its copy (read from
// request-scoped i18n) and builds its homogeneous step list in-component (the
// step headings need i18n, so the list can't be a static data array).
export function ProductStepperSection() {
  const i18n = getServerI18n();

  const steps: ProductStepperStepType[] = [
    {
      icon: 'users',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Data model`)}</HeadingPart>
      ),
      body: msg`Add objects and fields`,
      visual: DataModelVisual,
    },
    {
      icon: 'check',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Automation`)}</HeadingPart>
      ),
      body: msg`Create a workflow`,
      visual: WorkflowVisual,
    },
    {
      icon: 'eye',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Layout`)}</HeadingPart>
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
      <HeadingPart fontFamily="serif">
        {i18n._(msg`Go the extra mile`)}
      </HeadingPart>{' '}
      <HeadingPart fontFamily="sans">{i18n._(msg`with no-code`)}</HeadingPart>
    </Flow>
  );
}
