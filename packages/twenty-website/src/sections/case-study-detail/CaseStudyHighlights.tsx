import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { type CaseStudyKpi, CaseStudyStatGrid } from '@/case-studies';
import { SectionShell } from '@/ui';

import { CASE_STUDY_HIGHLIGHTS_ANCHOR } from './case-study-highlights-anchor';

const Frame = styled.div`
  margin-inline: auto;
  max-width: 556px;
  width: 100%;
`;

export type CaseStudyHighlightsProps = {
  industry: MessageDescriptor;
  kpis: readonly CaseStudyKpi[];
};

export function CaseStudyHighlights({
  industry,
  kpis,
}: CaseStudyHighlightsProps) {
  const cells: readonly CaseStudyKpi[] = [
    { value: industry, label: msg`Industry` },
    ...kpis,
  ];

  return (
    <SectionShell scheme="light">
      <Frame id={CASE_STUDY_HIGHLIGHTS_ANCHOR}>
        <CaseStudyStatGrid cells={cells} frame="band" />
      </Frame>
    </SectionShell>
  );
}
