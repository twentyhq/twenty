import { type SeparatorProps } from '../src/primitives/layout/Separator/types/SeparatorProps';

export const SEPARATOR_PROP_DESCRIPTIONS = {
  orientation: 'Direction of the divider: horizontal or vertical.',
  render:
    'Element or render function composed with the native separator props and ref.',
  className: 'CSS class or function of the separator orientation.',
  style:
    'Native style or function of the separator orientation. Use it for spacing and line color.',
} satisfies Partial<Record<keyof SeparatorProps, string>>;
