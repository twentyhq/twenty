import { type BadgeProps } from '../src/primitives/data-display/Badge/types/BadgeProps';

export const BADGE_PROP_DESCRIPTIONS = {
  children: 'Caller-provided text, numbers, icons, or other inline content.',
  size: 'Compact height, font size, and spacing: xs, sm, or md.',
  color:
    'Neutral tertiary, inherited text, primary accent, or secondary treatment.',
  shape:
    'Rounded pill label or fixed circle with width equal to its height. Use pill for longer content.',
  render:
    'Replaces the default span. Native props, handlers, and the ref target the rendered element.',
} satisfies Partial<Record<keyof BadgeProps, string>>;
