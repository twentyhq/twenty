import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { ConnectingFrame, SectionShell } from '@/ui';

import { CASE_STUDY_CATALOG, getCaseStudyAccent } from '@/case-studies';

import { CaseStudyCard } from './CaseStudyCard';

const CardGrid = styled.div`
  display: grid;
  gap: ${spacing(8)};
  grid-template-columns: 1fr;
  padding-block: ${spacing(16)} ${spacing(28)};

  ${mediaUp('md')} {
    gap: ${spacing(10)};
    grid-template-columns: repeat(2, 1fr);
    padding-block: ${spacing(20)} ${spacing(32)};
    padding-inline: ${spacing(12)};
  }

  ${mediaUp('lg')} {
    padding-inline: ${spacing(20)};
  }
`;

export function CaseStudyCatalogGrid() {
  const i18n = getServerI18n();
  const lastIndex = CASE_STUDY_CATALOG.length - 1;

  return (
    <SectionShell
      ariaLabel={i18n._(msg`Customer stories`)}
      background={<ConnectingFrame />}
      connectsUp
      rhythm="flush"
      scheme="muted"
    >
      <CardGrid>
        {CASE_STUDY_CATALOG.map((entry, index) => (
          <CaseStudyCard
            accent={getCaseStudyAccent(index)}
            entry={entry}
            key={entry.slug}
            variant={index === 0 || index === lastIndex ? 'large' : 'default'}
          />
        ))}
      </CardGrid>
    </SectionShell>
  );
}
