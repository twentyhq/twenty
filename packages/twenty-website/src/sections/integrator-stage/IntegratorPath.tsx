import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type CSSProperties, type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  buildSchemeContext,
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, GuideCrosshair, Heading, SectionShell } from '@/ui';

import { type IntegratorStep } from './integrator-step.type';
import { IntegratorReveal } from './IntegratorReveal';
import { IntegratorStairs } from './IntegratorStairs';

const PARTNER_CODE_SAMPLE = 'TWENTY-7F3K';

const Layout = styled.div`
  & > * + * {
    margin-top: ${spacing(12)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(16)};
    }
  }
`;

const Intro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  & > * + * {
    margin-top: ${spacing(5)};
  }

  ${mediaUp('md')} {
    align-items: end;
    column-gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 360px);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const IntroTitle = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const stepGridClassName = `integrator-path-grid`;

const StepRevealStyles = styled.div`
  .${stepGridClassName} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${spacing(3)} 0;
  }

  ${mediaUp('md')} {
    .${stepGridClassName} {
      column-gap: ${spacing(3)};
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

// The /apps card: hairline, radius 2, the artefact as a band on top, a flat
// fill sliding in on hover.
const Step = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  isolation: isolate;
  overflow: hidden;
  position: relative;

  &::before {
    background-color: ${color('white-5')};
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-101%);
    transition: transform ${DURATION.md} ${EASING.standard};
    z-index: -1;
  }

  &:hover::before {
    transform: translateX(0);
  }

  ${REDUCED_MOTION} {
    &::before {
      transition: none;
    }
  }
`;

const StepBody = styled.div`
  padding: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

// The rail: a number, then a line that runs to the next step.
const Rail = styled.div`
  align-items: center;
  column-gap: ${spacing(3)};
  display: flex;

  & > span:first-child {
    color: ${color('blue')};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    font-weight: ${FONT_WEIGHT.medium};
    letter-spacing: 0.04em;
  }
`;

const Tile = styled.div`
  ${buildSchemeContext('dark')}
  border-bottom: 1px solid ${semanticColor.line};
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const TileStage = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${spacing(7)};
  position: absolute;
`;

const FormSketch = styled.div`
  width: 100%;

  & > * + * {
    margin-top: ${spacing(3)};
  }

  & > span {
    border: 1px solid ${color('white-20')};
    border-radius: ${radius(1)};
    display: block;
    height: 30px;
    position: relative;
  }

  & > span::before {
    background-color: ${color('white-40')};
    border-radius: 1px;
    content: '';
    height: 4px;
    left: ${spacing(3)};
    position: absolute;
    top: 12px;
    transform-origin: left;
    transition: transform 500ms ${EASING.standard};
    width: var(--ink-width);
  }

  [data-integrator-step]:hover & > span::before {
    transform: scaleX(1.25);
  }

  & > span:last-child {
    background-color: ${color('white')};
    border-color: ${color('white')};
    margin-left: auto;
    width: 96px;
  }

  & > span:last-child::before {
    background-color: ${color('black')};
    left: 50%;
    margin-left: -20px;
    width: 40px;
  }
`;

const CodeTicket = styled.div`
  border: 1px dashed ${color('white-40')};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(4)};
  text-align: center;
  transition: transform 500ms ${EASING.standard};
  width: 100%;

  [data-integrator-step]:hover & {
    transform: translateY(-4px);
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const CodeLabel = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: 10px;
  letter-spacing: 0.08em;
  line-height: 14px;
  text-transform: uppercase;
`;

const CodeValue = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(5.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.12em;
  line-height: 1.2;
`;

const EarningSketch = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`;

const EarningFigure = styled.p`
  align-items: baseline;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: flex;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(10)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.03em;
  line-height: 1;

  & > span {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('mono')};
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const tileStairsClassName = `integrator-path-stairs`;

const StairsFrame = styled.div`
  .${tileStairsClassName} {
    --stairs-ink: ${color('blue')};

    border-bottom: 1px solid ${color('white-20')};
    height: 84px;
    transform-origin: bottom;
    transition: transform 500ms ${EASING.standard};
  }

  [data-integrator-step]:hover & .${tileStairsClassName} {
    transform: scaleY(1.12);
  }

  ${REDUCED_MOTION} {
    .${tileStairsClassName} {
      transition: none;
    }
  }
`;

const StepCopy = styled.div`
  max-width: 400px;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const HelpRow = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-wrap: wrap;
  padding-top: ${spacing(6)};

  /* The section guide draws this rule from md up. */
  ${mediaUp('md')} {
    border-top-color: transparent;
  }
  gap: ${spacing(1)} ${spacing(4)};

  & > span:first-child {
    color: ${color('blue')};
    display: inline-flex;
  }
`;

// Distance from the section's bottom edge to the help row's top edge (md up).
const HELP_ROW_GUIDE_FROM_BOTTOM_PX = 114;

const FORM_INK_WIDTHS = ['34%', '52%', '44%'];

type IntegratorPathProps = {
  anchorId: string;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  steps: readonly IntegratorStep[];
  help: {
    title: MessageDescriptor;
    body: MessageDescriptor;
    marker: ReactNode;
  };
};

// PROTOTYPE direction d: each step shows the thing you hold at that point.
export function IntegratorPath({
  anchorId,
  eyebrow,
  heading,
  body,
  steps,
  help,
}: IntegratorPathProps) {
  const i18n = getServerI18n();
  const artefacts: ReactNode[] = [
    <FormSketch key="form">
      {FORM_INK_WIDTHS.map((inkWidth) => (
        <span
          key={inkWidth}
          style={{ '--ink-width': inkWidth } as CSSProperties}
        />
      ))}
      <span />
    </FormSketch>,
    <CodeTicket key="code">
      <CodeLabel>{i18n._(msg`Partner code`)}</CodeLabel>
      <CodeValue>{PARTNER_CODE_SAMPLE}</CodeValue>
    </CodeTicket>,
    <EarningSketch key="earning">
      <EarningFigure>
        {i18n._(msg`20%`)}
        <span>{i18n._(msg`12 months`)}</span>
      </EarningFigure>
      <StairsFrame>
        <IntegratorStairs className={tileStairsClassName} />
      </StairsFrame>
    </EarningSketch>,
  ];

  return (
    <SectionShell
      background={
        // PROTOTYPE section guide: replaces the help row's rule from md up.
        <GuideCrosshair
          crossX="50%"
          crossY={`calc(100% - ${HELP_ROW_GUIDE_FROM_BOTTOM_PX}px)`}
          verticalLines={false}
        />
      }
      scheme="dark"
    >
      <Layout id={anchorId}>
        <Intro>
          <IntroTitle>
            <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(heading)}
            </Heading>
          </IntroTitle>
          <Body muted size="sm">
            {i18n._(body)}
          </Body>
        </Intro>
        <StepRevealStyles>
          <IntegratorReveal className={stepGridClassName} role="list">
            {steps.map((step, index) => (
              <Step data-integrator-step="" key={step.title.id} role="listitem">
                <Tile aria-hidden>
                  <TileStage>{artefacts[index]}</TileStage>
                </Tile>
                <StepBody>
                  <Rail>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </Rail>
                  <StepCopy>
                    <Heading as="h3" family="sans" size="xs" weight="medium">
                      {i18n._(step.title)}
                    </Heading>
                    <Body muted size="sm">
                      {i18n._(step.body)}
                    </Body>
                  </StepCopy>
                </StepBody>
              </Step>
            ))}
          </IntegratorReveal>
        </StepRevealStyles>
        <HelpRow>
          <span>{help.marker}</span>
          <Body as="span" size="sm" weight="medium">
            {i18n._(help.title)}
          </Body>
          <Body as="span" muted size="sm">
            {i18n._(help.body)}
          </Body>
        </HelpRow>
      </Layout>
    </SectionShell>
  );
}
