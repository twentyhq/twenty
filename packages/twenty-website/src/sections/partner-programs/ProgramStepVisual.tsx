'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { DiscordMark } from '@/icons';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { type ProgramStepVisual as ProgramStepVisualModel } from './program-step.type';

const FORM_INK_WIDTHS = ['34%', '52%', '44%'];
const MONTH_COUNT = 12;
const MONTHS = Array.from({ length: MONTH_COUNT }, (_, index) => index + 1);
// A flat payout: every month's column at the same height.
const LEVEL_HEIGHT = 0.5;

const FormSketch = styled.div`
  width: 100%;

  & > * + * {
    margin-top: ${spacing(3)};
  }

  & > span {
    border: 1px solid ${color('white-20')};
    border-radius: ${radius(1)};
    display: block;
    height: 34px;
    position: relative;
  }

  & > span::after {
    background-color: ${color('white-40')};
    content: '';
    height: 2px;
    left: ${spacing(3)};
    position: absolute;
    top: 50%;
    width: var(--ink-width);
  }

  & > span:last-child {
    background-color: ${color('white')};
    border-color: ${color('white')};
    margin-left: auto;
    width: 30%;
  }

  & > span:last-child::after {
    background-color: ${color('black')};
    left: 30%;
    width: 40%;
  }
`;

const DiscordBadge = styled.div`
  color: ${color('blue')};
  display: flex;
`;

const CodeTicket = styled.div`
  border: 1px dashed ${color('white-40')};
  border-radius: ${radius(2)};
  padding: ${spacing(6)} ${spacing(8)};
  text-align: center;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const MonoLabel = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const CodeValue = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(6)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.12em;
`;

const Earning = styled.div`
  width: 100%;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const EarningFigure = styled.p`
  align-items: baseline;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: flex;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(12)};
  font-weight: ${FONT_WEIGHT.light};
  line-height: 1;

  & > span {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(2.75)};
    font-weight: ${FONT_WEIGHT.medium};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

// Twelve months as dash columns, the ledger's motif.
const Stairs = styled.div`
  align-items: end;
  column-gap: 4px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  height: 96px;

  & > span {
    background-color: ${color('blue')};
    height: calc(var(--step) * 100%);
    mask-image: repeating-linear-gradient(
      to top,
      black 0 2px,
      transparent 2px 6px
    );
  }
`;

type ProgramStepVisualProps = {
  visual: ProgramStepVisualModel;
};

export function ProgramStepVisual({ visual }: ProgramStepVisualProps) {
  const { i18n } = useLingui();

  if (visual.kind === 'form') {
    return (
      <FormSketch>
        {FORM_INK_WIDTHS.map((inkWidth) => (
          <span
            key={inkWidth}
            style={{ '--ink-width': inkWidth } as CSSProperties}
          />
        ))}
        <span />
      </FormSketch>
    );
  }

  if (visual.kind === 'ticket') {
    return (
      <CodeTicket>
        <MonoLabel>{i18n._(visual.label)}</MonoLabel>
        <CodeValue>{visual.value}</CodeValue>
      </CodeTicket>
    );
  }

  if (visual.kind === 'earning') {
    return (
      <Earning>
        <EarningFigure>
          {i18n._(visual.figure)}
          <span>{i18n._(visual.caption)}</span>
        </EarningFigure>
        <Stairs>
          {MONTHS.map((month) => (
            <span
              key={month}
              style={
                {
                  '--step':
                    visual.trend === 'rising'
                      ? month / MONTH_COUNT
                      : LEVEL_HEIGHT,
                } as CSSProperties
              }
            />
          ))}
        </Stairs>
      </Earning>
    );
  }

  return (
    <DiscordBadge>
      <DiscordMark size={72} />
    </DiscordBadge>
  );
}
