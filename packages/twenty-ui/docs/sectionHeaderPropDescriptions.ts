import { type SectionHeaderProps } from '../src/components/Section/types/SectionHeaderProps';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';

export const SECTION_HEADER_PROP_DESCRIPTIONS = {
  ...HEADING_PROP_DESCRIPTIONS,
  title: 'Content of the section heading.',
  description:
    'Supporting text associated with the heading. Strings support links and overflow tooltips; React nodes render as supplied.',
  adornment:
    'Content alongside the heading, such as an action button or status.',
  descriptionLineClamp:
    'Maximum visible lines for a string description. Defaults to `5`. Overflowing descriptions can be read in a tooltip on hover or focus.',
} satisfies Partial<Record<keyof SectionHeaderProps, string>>;
