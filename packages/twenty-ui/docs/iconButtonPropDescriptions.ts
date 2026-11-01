import { type IconButtonProps } from '../src/components/input/IconButton/types/IconButtonProps';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';

export const ICON_BUTTON_PROP_DESCRIPTIONS = {
  ...BUTTON_PROP_DESCRIPTIONS,
  size: 'Button size: `xs` (20px), `sm` (24px), or `md` (32px).',
  shape: 'Square or round icon control.',
  children: 'Icon content. Decorative and hidden from assistive technology.',
  tooltip: 'Text displayed when hovering or focusing the button.',
  tooltipPlace: 'Preferred placement of the tooltip relative to the button.',
  tooltipDelay: 'Delay before showing the tooltip.',
  tooltipOffset: 'Distance in pixels between the button and the tooltip.',
  'aria-label':
    'Accessible name describing the action. Required unless `aria-labelledby` supplies the name.',
  'aria-labelledby':
    'ID of the element supplying the accessible name. Can be used instead of `aria-label`.',
} satisfies Partial<Record<keyof IconButtonProps, string>>;
