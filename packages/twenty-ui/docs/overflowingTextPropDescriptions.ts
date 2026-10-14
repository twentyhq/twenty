import { type OverflowingTextProps } from '../src/primitives/typography/OverflowingText/types/OverflowingTextProps';

export const OVERFLOWING_TEXT_PROP_DESCRIPTIONS = {
  truncate:
    'Single-line ellipsis by default. Set false to wrap. Cannot be combined with `lineClamp`.',
  lineClamp:
    'Positive integer limiting visible lines while preserving whitespace and line breaks. Cannot be combined with `truncate`.',
  dir: 'Text direction. Defaults to auto.',
  render:
    'Replaces the default div. Native props, styles, handlers and ref target the displayed text.',
} satisfies Partial<Record<keyof OverflowingTextProps, string>>;
