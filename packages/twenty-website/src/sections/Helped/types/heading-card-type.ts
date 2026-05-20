import type { MessageDescriptor } from '@lingui/core';

import type { HelpedVisualId } from './helped-visual-id';

export type HeadingCardType = {
  icon: string;
  illustration: HelpedVisualId;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  href: string;
};
