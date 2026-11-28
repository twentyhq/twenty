import { type MessageDescriptor } from '@lingui/core';

import { type IconComponent } from '@/icons';

export type IntegratorLevel = {
  label: MessageDescriptor;
  title: MessageDescriptor;
  tagline: MessageDescriptor;
  headline: MessageDescriptor;
  headlineSuffix?: MessageDescriptor;
  perksIntro: MessageDescriptor;
  perks: readonly {
    icon: IconComponent;
    title: MessageDescriptor;
    description: MessageDescriptor;
  }[];
  requirement?: MessageDescriptor;
};
