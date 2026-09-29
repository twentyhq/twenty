import { type ComponentProps } from 'react';

import { type Callout } from '../src/components/feedback/Callout/Callout';

export const CALLOUT_PROP_DESCRIPTIONS = {
  variant: 'Semantic appearance: info, warning, error, neutral, or success.',
  title: 'Main message displayed beside the icon.',
  description: 'Optional supporting text. Empty strings are hidden.',
  fullWidth: 'Fills the available container width.',
  Icon: 'Leading icon component. Defaults to the help icon.',
  action: 'Optional footer action with a label and onClick callback.',
  isClosable:
    'Shows a close button that hides the callout until it is remounted.',
  closeLabel: 'Accessible name of the dismiss button. Defaults to `Close`.',
  onClose: 'Called after the close button hides the callout.',
} satisfies Partial<Record<keyof ComponentProps<typeof Callout>, string>>;
