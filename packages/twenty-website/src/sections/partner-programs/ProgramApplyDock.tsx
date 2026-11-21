'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { type ReactNode } from 'react';

import {
  HalftoneModel,
  type HalftoneModelProps,
} from '@/platform/visuals/rigs/HalftoneModel';
import { FloatingDock } from '@/ui';

type ProgramApplyDockProps = {
  action: ReactNode;
  model: Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
};

export function ProgramApplyDock({ action, model }: ProgramApplyDockProps) {
  const { i18n } = useLingui();
  return (
    <FloatingDock
      action={action}
      label={i18n._(msg`Earn 20% for 12 months`)}
      media={
        <HalftoneModel
          initialPose={model.initialPose}
          modelUrl={model.modelUrl}
          settings={model.settings}
        />
      }
    />
  );
}
