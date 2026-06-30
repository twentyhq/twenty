import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { Fragment } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionIntro, SectionShell } from '@/ui';

import { ProblemVisual } from './ProblemVisual';
import { PROBLEM_POINTS } from './problem.data';

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(12)};

  ${mediaUp('md')} {
    column-gap: ${spacing(4)};
    grid-template-columns: 1fr 1fr;
  }
`;

const ContentStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(15)};

    & > * + * {
      margin-top: ${spacing(20)};
    }
  }
`;

const PointList = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    max-width: 454px;
  }
`;

const PointDivider = styled.div`
  border-top: 0.75px dashed ${semanticColor.divider};
  height: 0;
  width: 100%;
`;

const PointStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${mediaUp('md')} {
    max-width: 380px;
  }
`;

const PointHeading = styled.h3`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  letter-spacing: -0.04em;
  font-weight: ${FONT_WEIGHT.regular};
  line-height: 1.35;
`;

export function Problem() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SplitLayout>
        <ProblemVisual />
        <ContentStack>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`The Problem.`)}</Eyebrow>
            <Heading as="h2" size="md" weight="light">
              {i18n._(
                msg`A custom CRM gives your org an edge, *but building one* comes with *tradeoffs*`,
              )}
            </Heading>
          </SectionIntro>
          <PointList>
            {PROBLEM_POINTS.map((point) => (
              <Fragment key={point.heading.id}>
                <PointDivider aria-hidden />
                <PointStack>
                  <PointHeading>{i18n._(point.heading)}</PointHeading>
                  <Body muted size="sm">
                    {i18n._(point.body)}
                  </Body>
                </PointStack>
              </Fragment>
            ))}
          </PointList>
        </ContentStack>
      </SplitLayout>
    </SectionShell>
  );
}
