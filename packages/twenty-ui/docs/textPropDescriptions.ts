import { type TextProps } from '../src/primitives/typography/Text/types/TextProps';

export const TEXT_PROP_DESCRIPTIONS = {
  truncate:
    'Truncates one line with an ellipsis. Cannot be combined with `lineClamp`.',
  lineClamp:
    'Positive integer limiting the number of visible lines. Cannot be combined with `truncate`.',
  render:
    'Replaces the default div. Native props and the ref target the rendered text element.',
} satisfies Partial<Record<keyof TextProps, string>>;
