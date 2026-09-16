import { type IconButtonProps } from '../src/components/IconButton/types/IconButtonProps';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';

export const ICON_BUTTON_PROP_DESCRIPTIONS = {
  ...BUTTON_PROP_DESCRIPTIONS,
  size: 'Square button size: `sm` (24px) or `md` (32px).',
  children: 'Icon content. Decorative and hidden from assistive technology.',
  'aria-label': 'Required accessible name describing the action.',
} satisfies Partial<Record<keyof IconButtonProps, string>>;
