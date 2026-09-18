import { type FloatingIconButtonProps } from '../src/components/FloatingIconButton/types/FloatingIconButtonProps';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';

export const FLOATING_ICON_BUTTON_PROP_DESCRIPTIONS = {
  ...ICON_BUTTON_PROP_DESCRIPTIONS,
  blur: 'Blurs content behind the floating surface. Enabled by default.',
  elevated: 'Adds a shadow to the floating surface. Enabled by default.',
} satisfies Partial<Record<keyof FloatingIconButtonProps, string>>;
