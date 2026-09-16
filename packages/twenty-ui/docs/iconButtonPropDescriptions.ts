import { type IconButtonProps } from '../src/components/IconButton/types/IconButtonProps';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';

export const ICON_BUTTON_PROP_DESCRIPTIONS = {
  ...BUTTON_PROP_DESCRIPTIONS,
  size: 'Square button size: `sm` (24px) or `md` (32px).',
  children: 'Icon content. Decorative and hidden from assistive technology.',
  tooltip: 'Text displayed when hovering or focusing the button.',
  tooltipPlace: 'Preferred placement of the tooltip relative to the button.',
  tooltipDelay: 'Delay before showing the tooltip.',
  tooltipOffset: 'Distance in pixels between the button and the tooltip.',
  'aria-label': 'Required accessible name describing the action.',
} satisfies Partial<Record<keyof IconButtonProps, string>>;
