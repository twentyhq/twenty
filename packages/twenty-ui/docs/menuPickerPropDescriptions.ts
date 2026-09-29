import { type ComponentProps } from 'react';

import { type MenuPicker } from '../src/components/navigation/MenuPicker/MenuPicker';

export const MENU_PICKER_PROP_DESCRIPTIONS = {
  id: 'Button ID.',
  className: 'Class applied to the button.',
  disabled: 'Disables the button.',
  icon: 'Leading icon component.',
  label: 'Button label and accessible name, including when showLabel is false.',
  onClick: 'Activation callback.',
  selected: 'Controls selected styling and aria-pressed.',
  showLabel: 'Shows the visible label beside the icon.',
  testId: 'Value of the button’s data-testid attribute.',
  tooltipContent: 'Optional tooltip text.',
  tooltipDelay: 'Hover delay in milliseconds.',
  tooltipOffset: 'Distance between the button and tooltip in pixels.',
} satisfies Partial<Record<keyof ComponentProps<typeof MenuPicker>, string>>;
