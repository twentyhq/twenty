import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { Eyebrow, HeadingPart } from '@/design-system/components';
import {
  ProblemContent,
  ProblemHeading,
  ProblemPoints,
  ProblemSection,
  ProblemVisual,
  type ProblemPointType,
} from '@/sections/Problem';

export function HomeProblem() {
  const points: ProblemPointType[] = [
    {
      heading: (
        <HeadingPart fontFamily="sans">
          <Trans>The Giant Monolith</Trans>
        </HeadingPart>
      ),
      body: msg`Proprietary languages, slow deployment cycles, and "black box" logic.`,
    },
    {
      heading: (
        <HeadingPart fontFamily="sans">
          <Trans>The In-house Burden</Trans>
        </HeadingPart>
      ),
      body: msg`It's fragile. V1 ships quickly, but maintaining and making changes is a long term burden.`,
    },
  ];

  return (
    <ProblemSection>
      <ProblemVisual />
      <ProblemContent>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            <Trans>The Problem.</Trans>
          </HeadingPart>
        </Eyebrow>
        <ProblemHeading>
          <Trans>
            <HeadingPart fontFamily="serif">
              A custom CRM gives your org an edge,
            </HeadingPart>
            <HeadingPart fontFamily="sans">but building one</HeadingPart>
            <HeadingPart fontFamily="serif">comes with</HeadingPart>
            <HeadingPart fontFamily="sans">tradeoffs</HeadingPart>
          </Trans>
        </ProblemHeading>
        <ProblemPoints points={points} />
      </ProblemContent>
    </ProblemSection>
  );
}
