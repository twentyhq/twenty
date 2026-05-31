import type { ClientIconKey } from '@/icons';
import type { MessageDescriptor } from '@lingui/core';

import type { HelpedVisualId } from './helped-visual-id';

export type HeadingCardType = {
  icon: ClientIconKey;
  illustration: HelpedVisualId;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  href: string;
};
