import { type ButtonGroupProps } from '../src/primitives/input/ButtonGroup/types/ButtonGroupProps';

export const BUTTON_GROUP_PROP_DESCRIPTIONS = {
  attached:
    'Join adjacent controls. Set to false for independently rounded buttons with a 2px gap.',
  framed:
    'Add a translucent frame with padding and concentric corners. Button sizes and appearance remain independent unless set on the group.',
  variant:
    'Default surface treatment for children without an explicit variant.',
  color: 'Default semantic color for children without an explicit color.',
  size: 'Default button height for children without an explicit size.',
} satisfies Partial<Record<keyof ButtonGroupProps, string>>;
