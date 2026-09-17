import { type SectionRootProps } from '../src/components/Section/types/SectionRootProps';

export const SECTION_ROOT_PROP_DESCRIPTIONS = {
  align: 'Text alignment within the section. Defaults to `left`.',
  color: 'Text color within the section. Defaults to `primary`.',
  fullWidth:
    'Whether the section fills the available width. Defaults to `true`.',
} satisfies Partial<Record<keyof SectionRootProps, string>>;
