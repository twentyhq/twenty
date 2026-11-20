import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

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

import { CREATOR_STEPS } from './creator-steps.data';
import { CreatorColumns } from './CreatorColumns';

const HeadingAnchor = styled.div`
  scroll-margin-top: ${spacing(32)};
`;

const StepList = styled.ol`
  list-style: none;
  padding: 0;
`;

// Number, title, body on one row; a hairline between rows.
const Step = styled.li`
  border-top: 1px solid ${semanticColor.line};
  display: grid;
  grid-template-columns: ${spacing(10)} minmax(0, 1fr);
  padding-block: ${spacing(5)};

  &:first-child {
    border-top-color: transparent;
    padding-top: 0;
  }

  & > [data-slot='body'] {
    grid-column: 2;
    margin-top: ${spacing(2)};
  }

  ${mediaUp('md')} {
    column-gap: ${spacing(6)};
    grid-template-columns: ${spacing(10)} minmax(0, 2fr) minmax(0, 3fr);

    & > [data-slot='body'] {
      grid-column: 3;
      margin-top: 0;
    }
  }
`;

const StepNumber = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  line-height: ${fontSize(6.5)};
`;

const StepTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.02em;
  line-height: 1.3;
`;

const BodyMeasure = styled.div`
  max-width: 420px;
`;

type CreatorStepsProps = {
  anchorId: string;
};

// PROTOTYPE from link to payout, as rows on the page grid.
export function CreatorSteps({ anchorId }: CreatorStepsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <CreatorColumns>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`How it works`)}</Eyebrow>
          <HeadingAnchor id={anchorId}>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`From link *to payout*`)}
            </Heading>
          </HeadingAnchor>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Share your link, we credit the signups it brings, and you get paid every month the customer stays, for up to 12 months.`,
              )}
            </Body>
          </BodyMeasure>
        </SectionIntro>
        <StepList>
          {CREATOR_STEPS.map((step, index) => (
            <Step key={step.title.id}>
              <StepNumber aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </StepNumber>
              <StepTitle>{i18n._(step.title)}</StepTitle>
              <div data-slot="body">
                <Body muted size="sm">
                  {i18n._(step.body)}
                </Body>
              </div>
            </Step>
          ))}
        </StepList>
      </CreatorColumns>
    </SectionShell>
  );
}
