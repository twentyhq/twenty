import { type ButtonProps } from '../src/primitives/input/Button/types/ButtonProps';

export const BUTTON_PROP_DESCRIPTIONS = {
  variant: 'Visual treatment of the button surface.',
  color: 'Semantic color of the button.',
  size: 'Button height: `sm` (24px) or `md` (32px).',
  fullWidth: 'Expands the button to fill its container width.',
  loading:
    'Shows a loading indicator and disables activation while preserving the button width.',
  elevated: 'Adds a shadow to the button.',
  startIcon: 'Decorative content displayed before the label.',
  endIcon: 'Decorative content displayed after the label.',
  hotkeys: 'Keyboard shortcut hints displayed on non-mobile screens.',
  soon: 'Displays a coming-soon label and disables activation.',
  soonLabel: 'Text for the coming-soon label.',
} satisfies Partial<Record<keyof ButtonProps, string>>;
