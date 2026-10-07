import { type ComponentProps } from 'react';

import { type Callout } from '../src/components/feedback/Callout/Callout';

export const CALLOUT_PROP_DESCRIPTIONS = {
  status:
    'Feedback meaning: neutral, info, success, warning, or error. Defaults to info.',
  variant: 'Supported appearance: soft.',
  color:
    'Palette override: gray, blue, green, orange, or red. Defaults to the status palette.',
  title: 'Main message node displayed beside the icon.',
  description: 'Optional supporting content node. Empty slots are hidden.',
  fullWidth: 'Removes the default 512px maximum width.',
  icon: 'Leading icon node. Defaults to a decorative help icon. Pass null to omit it.',
  action: 'Optional footer node, such as a Button, link, or group of actions.',
  closeLabel: 'Accessible name of the dismiss button. Defaults to `Close`.',
  onDismiss:
    'Shows a dismiss button and notifies the caller once per activation. The caller owns visibility.',
  className: 'Additional class names merged onto the root.',
  style: 'Inline styles forwarded to the root.',
  ref: 'Ref to the root div, or the element supplied through render.',
  render:
    'Element or callback composition for the root. Receives status, variant, and color state.',
} satisfies Partial<Record<keyof ComponentProps<typeof Callout>, string>>;
