'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ChangeEvent, useEffect, useState } from 'react';

import { useAnimatedNumber } from '@/platform/motion';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Field } from '@/ui';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { INTEGRATOR_LEDGER } from './integrator-ledger-config';

const CHART_HEIGHT_PX = 168;
const DASH_PITCH_PX = 6;
const DASH_ROWS = CHART_HEIGHT_PX / DASH_PITCH_PX;
const MONTHS = Array.from(
  { length: INTEGRATOR_LEDGER.months },
  (_, index) => index + 1,
);
const READOUT_ENTRANCE_DELAY_MS = 900;

// Outlined like the level cards above it.
const Panel = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)};
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    padding: ${spacing(7)};
  }

  & > * + * {
    margin-top: ${spacing(6)};
  }

  /* Wide: figures and slider left, chart right. */
  @container (min-width: 880px) {
    align-items: end;
    display: grid;
    gap: ${spacing(6)} ${spacing(16)};
    grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);

    & > * + * {
      margin-top: 0;
    }

    & > * {
      grid-column: 1;
    }

    & > :nth-child(1) {
      align-self: start;
    }

    & > :nth-child(2) {
      grid-column: 2;
      grid-row: 1 / span 3;
    }
  }

  @keyframes integratorLedgerPanelIn {
    from {
      opacity: 0;
      transform: translateY(28px) scale(0.985);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes integratorLedgerRowIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes integratorLedgerColumnIn {
    from {
      clip-path: inset(100% 0 0 0);
    }

    to {
      clip-path: inset(0 0 0 0);
    }
  }

  animation: integratorLedgerPanelIn 1200ms ${EASING.standard} 250ms both;

  & > * {
    animation: integratorLedgerRowIn 900ms ${EASING.standard} both;
    animation-delay: calc(var(--row, 0) * 90ms + 500ms);
  }

  ${REDUCED_MOTION} {
    animation: none;

    & > * {
      animation: none;
    }
  }
`;

const Stack = styled.div`
  container-type: inline-size;
  position: relative;
  width: 100%;
`;

const ReadoutValue = styled.output`
  ${typeRampDeclarations('headingLg')}
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('serif')};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
`;

const Chart = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Columns = styled.div`
  border-bottom: 1px solid ${semanticColor.lineStrong};
  column-gap: ${spacing(1.5)};
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  height: ${CHART_HEIGHT_PX}px;
`;

const Column = styled.span`
  height: 100%;
  position: relative;

  /* The empty track: every dash a month could still light. */
  &::before {
    background-image: repeating-linear-gradient(
      to top,
      ${semanticColor.line} 0 2px,
      transparent 2px ${DASH_PITCH_PX}px
    );
    content: '';
    inset: 0;
    position: absolute;
  }
`;

const ColumnEntrance = styled.span`
  animation: integratorLedgerColumnIn 700ms ${EASING.standard} both;
  animation-delay: calc(var(--month) * 55ms + 800ms);
  inset: 0;
  position: absolute;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const ColumnFill = styled.span`
  background-color: ${color('blue')};
  clip-path: inset(calc((1 - var(--fill)) * 100%) 0 0 0);
  inset: 0;
  mask-image: repeating-linear-gradient(
    to top,
    black 0 2px,
    transparent 2px ${DASH_PITCH_PX}px
  );
  position: absolute;
  transition: clip-path ${DURATION.lg} ${EASING.standard};

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ColumnCap = styled.span`
  background-color: ${semanticColor.ink};
  height: 2px;
  left: 0;
  position: absolute;
  right: 0;
  top: -2px;
  transform: translateY(calc((1 - var(--fill)) * ${CHART_HEIGHT_PX}px + 4px));
  transition: transform ${DURATION.lg} ${EASING.standard};

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const MonthTicks = styled.div`
  column-gap: ${spacing(1.5)};
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));

  & > span {
    ${typeRampDeclarations('bodyXs')}
    color: ${semanticColor.inkSubtle};
    font-family: ${fontFamily('sans')};
    text-align: center;
  }
`;

const SliderBlock = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// The Field label recipe, on a <label> so it targets the slider.
const SliderHeader = styled.label`
  ${typeRampDeclarations('bodyXs')}
  align-items: baseline;
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
  justify-content: space-between;
`;

const SeatValue = styled.span`
  ${typeRampDeclarations('headingXs')}
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.regular};
`;

const Slider = styled.input`
  appearance: none;
  background: linear-gradient(
      to right,
      ${semanticColor.ink} var(--progress),
      ${semanticColor.line} var(--progress)
    )
    center / 100% 2px no-repeat;
  cursor: pointer;
  display: block;
  height: ${spacing(6)};
  width: 100%;

  &::-webkit-slider-thumb {
    appearance: none;
    background-color: ${semanticColor.ink};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 4px ${semanticColor.line};
    height: 16px;
    transition: box-shadow ${DURATION.xxs} ${EASING.gentle};
    width: 16px;
  }

  &::-moz-range-thumb {
    background-color: ${semanticColor.ink};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 4px ${semanticColor.line};
    height: 16px;
    width: 16px;
  }

  &:hover::-webkit-slider-thumb,
  &:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 7px ${semanticColor.line};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }
`;

const Footnote = styled.p`
  ${typeRampDeclarations('bodyXs')}
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
`;

const filledDashFraction = (month: number, seats: number): number => {
  const { minSeats, maxSeats, months } = INTEGRATOR_LEDGER;
  const seatProgress = (seats - minSeats) / (maxSeats - minSeats);
  // Eased so small books still draw a readable staircase.
  const level = 0.3 + 0.7 * seatProgress ** 0.5;
  const litDashes = Math.max(
    1,
    Math.round(DASH_ROWS * (month / months) * level),
  );

  return litDashes / DASH_ROWS;
};

type IntegratorLedgerProps = {
  footnote: string;
};

// Seats in, twelve months of commission out.
export function IntegratorLedger({ footnote }: IntegratorLedgerProps) {
  const { i18n } = useLingui();
  const [seats, setSeats] = useState(INTEGRATOR_LEDGER.defaultSeats);
  const [hasEntered, setHasEntered] = useState(false);

  // The readout counts up once, after the panel has landed.
  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setHasEntered(true),
      READOUT_ENTRANCE_DELAY_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, []);

  const { commissionRate, months, seatPricePerMonth, minSeats, maxSeats } =
    INTEGRATOR_LEDGER;
  const commission = Math.round(
    seats * seatPricePerMonth * commissionRate * months,
  );
  const shownCommission = useAnimatedNumber(hasEntered ? commission : 0);
  const seatProgress = (seats - minSeats) / (maxSeats - minSeats);
  const currency = new Intl.NumberFormat(i18n.locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const handleSeatsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeats(Number(event.target.value));
  };

  return (
    <Stack>
      <Panel>
        <div style={cssVariableStyle({ '--row': 0 })}>
          <Field
            hint={i18n._(msg`Estimate, over 12 months`)}
            label={i18n._(msg`Your commission`)}
          >
            <ReadoutValue aria-live="polite" htmlFor="integrator-ledger-seats">
              {currency.format(shownCommission)}
            </ReadoutValue>
          </Field>
        </div>
        <Chart aria-hidden style={cssVariableStyle({ '--row': 1 })}>
          <Columns>
            {MONTHS.map((month) => (
              <Column
                key={month}
                style={cssVariableStyle({
                  '--fill': filledDashFraction(month, seats),
                  '--month': month,
                })}
              >
                <ColumnEntrance>
                  <ColumnFill />
                  <ColumnCap />
                </ColumnEntrance>
              </Column>
            ))}
          </Columns>
          <MonthTicks>
            {MONTHS.map((month) => (
              <span key={month}>{String(month).padStart(2, '0')}</span>
            ))}
          </MonthTicks>
        </Chart>
        <SliderBlock style={cssVariableStyle({ '--row': 2 })}>
          <SliderHeader htmlFor="integrator-ledger-seats">
            {i18n._(msg`Seats you bring`)}
            <SeatValue>{seats}</SeatValue>
          </SliderHeader>
          <Slider
            id="integrator-ledger-seats"
            max={maxSeats}
            min={minSeats}
            onChange={handleSeatsChange}
            step={INTEGRATOR_LEDGER.seatStep}
            style={cssVariableStyle({ '--progress': `${seatProgress * 100}%` })}
            type="range"
            value={seats}
          />
        </SliderBlock>
        <Footnote style={cssVariableStyle({ '--row': 3 })}>
          {i18n._(
            msg`Estimate on the Organization plan at $${seatPricePerMonth} per seat per month, billed yearly.`,
          )}{' '}
          {footnote}
        </Footnote>
      </Panel>
    </Stack>
  );
}
