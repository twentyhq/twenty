import { type ComponentProps } from 'react';

import { type ClickToActionLink } from '../src/primitives/navigation/ClickToActionLink/ClickToActionLink';

export const CLICK_TO_ACTION_LINK_PROP_DESCRIPTIONS = {
  children:
    'Visible link text or content. Use a descriptive destination label.',
  className: 'CSS class applied to the anchor.',
  href: 'Destination URL for native link navigation.',
  onClick: 'Click handler called when the link is activated.',
  target: 'Browsing context in which to open the destination.',
  rel: 'Relationship to the destination, such as `noopener noreferrer` for a new tab.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ClickToActionLink>, string>
>;
