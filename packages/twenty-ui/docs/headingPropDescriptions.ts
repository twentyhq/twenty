import { type HeadingProps } from '../src/primitives/typography/Heading/types/HeadingProps';

export const HEADING_PROP_DESCRIPTIONS = {
  level:
    'Semantic heading level, from `h1` through `h6`. Does not change the visual size. Defaults to `2`.',
  size: 'Visual font size, independent of the heading level. Defaults to `md`.',
  color: 'Theme font color. Defaults to `primary`.',
} satisfies Partial<Record<keyof HeadingProps, string>>;
