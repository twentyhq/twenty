import { styled } from '@linaria/react';

import { type CaseStudyStory } from '@/case-studies';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { caseStudySectionId } from './case-study-section-id';
import { CaseStudyTextBlock } from './case-study-text-block';

const ReadingColumn = styled.div`
  margin-inline: auto;
  max-width: 556px;

  & > * + * {
    margin-top: ${spacing(12)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(24)};
    }
  }
`;

export type CaseStudyBodyProps = {
  story: CaseStudyStory;
};

export function CaseStudyBody({ story }: CaseStudyBodyProps) {
  return (
    <SectionShell keepsTopRhythm scheme="light">
      <ReadingColumn>
        {story.sections.map((section, index) => (
          <CaseStudyTextBlock
            key={getMessageDescriptorSource(section.heading)}
            section={section}
            sectionId={caseStudySectionId(index)}
          />
        ))}
      </ReadingColumn>
    </SectionShell>
  );
}
