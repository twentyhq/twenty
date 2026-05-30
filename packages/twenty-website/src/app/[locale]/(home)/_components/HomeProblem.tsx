import { msg } from '@lingui/core/macro';

import { Eyebrow, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  ProblemContent,
  ProblemHeading,
  ProblemPoints,
  ProblemSection,
  ProblemVisual,
  type ProblemPointType,
} from '@/sections/Problem';

export function HomeProblem() {
  const i18n = getServerI18n();

  const points: ProblemPointType[] = [
    {
      heading: (
        <HeadingPart fontFamily="sans">
          {i18n._(msg`The Giant Monolith`)}
        </HeadingPart>
      ),
      body: msg`Proprietary languages, slow deployment cycles, and "black box" logic.`,
    },
    {
      heading: (
        <HeadingPart fontFamily="sans">
          {i18n._(msg`The In-house Burden`)}
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
            {i18n._(msg`The Problem.`)}
          </HeadingPart>
        </Eyebrow>
        <ProblemHeading>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`A custom CRM gives your org an edge,`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`but building one`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="serif">
            {i18n._(msg`comes with`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">{i18n._(msg`tradeoffs`)}</HeadingPart>
        </ProblemHeading>
        <ProblemPoints points={points} />
      </ProblemContent>
    </ProblemSection>
  );
}
