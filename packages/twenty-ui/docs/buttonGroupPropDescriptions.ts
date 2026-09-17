import { type ButtonGroupProps } from '../src/primitives/input/ButtonGroup/types/ButtonGroupProps';

export const BUTTON_GROUP_PROP_DESCRIPTIONS = {
  attached:
    'Join adjacent controls. Set to false for independently rounded buttons with a 2px gap.',
  framed:
    'Add a translucent frame with padding and concentric corners. Button sizes and appearance remain independent unless set on the group.',
  variant:
    'Shared surface treatment that overrides the variant of buttons in the group.',
  color:
    'Shared semantic color that overrides the color of buttons in the group.',
  size: 'Shared button height that overrides the size of buttons in the group.',
} satisfies Partial<Record<keyof ButtonGroupProps, string>>;
