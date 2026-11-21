import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCalendar,
  IconCash,
  IconLink,
  IconPercentage,
} from '@tabler/icons-react';

import { type IconComponent } from '@/icons';

type CreatorFact = {
  icon: IconComponent;
  value: MessageDescriptor;
  label: MessageDescriptor;
};

// Same figures and strings as the live hero strip.
export const CREATOR_FACTS: readonly CreatorFact[] = [
  { icon: IconPercentage, value: msg`20%`, label: msg`Of seat revenue` },
  { icon: IconCalendar, value: msg`12 months`, label: msg`Per customer` },
  { icon: IconLink, value: msg`30 days`, label: msg`Of credit per click` },
  { icon: IconCash, value: msg`$50`, label: msg`Minimum payout` },
];
