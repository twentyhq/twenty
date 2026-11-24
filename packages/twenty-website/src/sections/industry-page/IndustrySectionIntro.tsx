import { type MessageDescriptor } from '@lingui/core';

import { type IndustrySectionId } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Eyebrow, Heading, SectionIntro } from '@/ui';

import { INDUSTRY_SECTION_EYEBROWS } from './industry-section-eyebrows';

type IndustrySectionIntroProps = {
  heading: MessageDescriptor;
  sectionId: IndustrySectionId;
};

export function IndustrySectionIntro({
  heading,
  sectionId,
}: IndustrySectionIntroProps) {
  const i18n = getServerI18n();

  return (
    <SectionIntro>
      <Eyebrow>{i18n._(INDUSTRY_SECTION_EYEBROWS[sectionId])}</Eyebrow>
      <Heading as="h2" size="md" weight="light">
        {i18n._(heading)}
      </Heading>
    </SectionIntro>
  );
}
