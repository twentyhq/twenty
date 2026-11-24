import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { CASE_STUDY_CATALOG, CaseStudyStatGrid } from '@/case-studies';
import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { spacing } from '@/tokens';
import { Body, Button, SectionShell, SectionStack } from '@/ui';

import { IndustrySectionIntro } from './IndustrySectionIntro';

const QuoteStack = styled.figure`
  display: grid;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

type IndustryProofProps = {
  page: ResolvedIndustryPage;
};

// Renders nothing without a real story: the framework never fakes proof.
export function IndustryProof({ page }: IndustryProofProps) {
  const i18n = getServerI18n();
  if (page.proof.kind === 'none') {
    return null;
  }

  const { caseStudySlug } = page.proof;
  const story = CASE_STUDY_CATALOG.find(
    (entry) => entry.slug === caseStudySlug,
  );
  if (!story) {
    return null;
  }

  return (
    <SectionShell scheme="muted">
      <SectionStack>
        <IndustrySectionIntro heading={story.title} sectionId="proof" />
        {story.quote && (
          <QuoteStack>
            <blockquote>
              <Body size="md">{i18n._(story.quote.text)}</Body>
            </blockquote>
            <figcaption>
              <Body muted size="sm">
                {`${story.quote.author} · ${i18n._(story.quote.role)}`}
              </Body>
            </figcaption>
          </QuoteStack>
        )}
        <CaseStudyStatGrid cells={story.kpis} frame="band" />
        <div>
          <Button
            href={`/customers/${story.slug}`}
            label={i18n._(msg`Read the story`)}
            variant="outlined"
          />
        </div>
      </SectionStack>
    </SectionShell>
  );
}
