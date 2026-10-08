import { type SectionHeaderProps } from '../src/components/layout/Section/types/SectionHeaderProps';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';

export const SECTION_HEADER_PROP_DESCRIPTIONS = {
  ...HEADING_PROP_DESCRIPTIONS,
  title: 'Content of the section heading.',
  description:
    'Supporting text associated with the heading. Strings have optional truncation and overflow tooltips; React nodes render as supplied.',
  actions: 'Content alongside the heading, such as an action button or status.',
  descriptionLineClamp:
    'Maximum visible lines for a string description. Defaults to `5`; use `false` to display the full description without a tooltip.',
  isDescriptionFocusable:
    'Adds a tab stop to a truncated string description so its overflow tooltip can open on focus. Defaults to `false`.',
} satisfies Partial<Record<keyof SectionHeaderProps, string>>;
