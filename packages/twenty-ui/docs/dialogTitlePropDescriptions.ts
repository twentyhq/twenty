import { type DialogTitleProps } from '../src/primitives/surfaces/Dialog/types/DialogTitleProps';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';

export const DIALOG_TITLE_PROP_DESCRIPTIONS = {
  ...HEADING_PROP_DESCRIPTIONS,
  size: 'Visual font size, independent of the heading level. Defaults to `lg`.',
} satisfies Partial<Record<keyof DialogTitleProps, string>>;
