'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import {
  type ChangeEvent,
  type CSSProperties,
  useEffect,
  useState,
} from 'react';

import { useAnimatedNumber } from '@/platform/motion';
import {
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

import { INTEGRATOR_LEDGER } from './integrator-ledger-config';

const CHART_HEIGHT_PX = 168;
const DASH_PITCH_PX = 6;
const DASH_ROWS = CHART_HEIGHT_PX / DASH_PITCH_PX;
const MONTHS = Array.from(
  { length: INTEGRATOR_LEDGER.months },
  (_, index) => index + 1,
);
const READOUT_ENTRANCE_DELAY_MS = 900;

// Dark glass, the Twenty way: square corners, hairline, one top highlight.
const Panel = styled.div`
  background-color: ${color('black')};
  border: 1px solid ${color('white-10')};
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

  /* Wide (under the level cards): figures and slider left, chart right. */
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

    & > :nth-child(3) {
      grid-column: 2;
      grid-row: 1 / span 4;
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

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const MonoLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  line-height: 16px;
  text-transform: uppercase;

  &[data-strong] {
    color: ${semanticColor.ink};
  }
`;

const LabelWithMarker = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${spacing(2)};

  &::before {
    background-color: ${color('green')};
    border-radius: 1px;
    content: '';
    height: 7px;
    width: 14px;
  }
`;

const Readout = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const ReadoutValue = styled.output`
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(14)};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.03em;
  line-height: 1;

  ${mediaUp('md')} {
    font-size: ${fontSize(19)};
  }
`;

const Chart = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Columns = styled.div`
  border-bottom: 1px solid ${color('white-20')};
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
      ${color('white-10')} 0 2px,
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
  background-color: ${color('green')};
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
    color: ${semanticColor.inkSubtle};
    font-family: ${fontFamily('mono')};
    font-size: 10px;
    line-height: 14px;
    text-align: center;
  }
`;

const SliderBlock = styled.div`
  padding-top: ${spacing(5)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const SliderHeader = styled.label`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

const SeatValue = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
`;

const Slider = styled.input`
  appearance: none;
  background: linear-gradient(
      to right,
      ${color('white')} var(--progress),
      ${color('white-20')} var(--progress)
    )
    center / 100% 2px no-repeat;
  cursor: pointer;
  display: block;
  height: ${spacing(6)};
  width: 100%;

  &::-webkit-slider-thumb {
    appearance: none;
    background-color: ${color('white')};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 4px ${color('white-10')};
    height: 16px;
    transition: box-shadow ${DURATION.xxs} ${EASING.gentle};
    width: 16px;
  }

  &::-moz-range-thumb {
    background-color: ${color('white')};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 4px ${color('white-10')};
    height: 16px;
    width: 16px;
  }

  &:hover::-webkit-slider-thumb,
  &:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 7px ${color('white-20')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }
`;

const Footer = styled.div`
  padding-top: ${spacing(4)};

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const Footnote = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: 1.5;
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

// The hero object. Seats in, twelve months of commission out.
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
        <HeaderRow style={{ '--row': 0 } as CSSProperties}>
          <MonoLabel data-strong="">
            <LabelWithMarker>{i18n._(msg`Your commission`)}</LabelWithMarker>
          </MonoLabel>
        </HeaderRow>
        <Readout style={{ '--row': 1 } as CSSProperties}>
          <ReadoutValue aria-live="polite" htmlFor="integrator-ledger-seats">
            {currency.format(shownCommission)}
          </ReadoutValue>
          <MonoLabel>{i18n._(msg`Estimate, over 12 months`)}</MonoLabel>
        </Readout>
        <Chart aria-hidden style={{ '--row': 2 } as CSSProperties}>
          <Columns>
            {MONTHS.map((month) => (
              <Column
                key={month}
                style={
                  {
                    '--fill': filledDashFraction(month, seats),
                    '--month': month,
                  } as CSSProperties
                }
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
        <SliderBlock style={{ '--row': 3 } as CSSProperties}>
          <SliderHeader htmlFor="integrator-ledger-seats">
            <MonoLabel>{i18n._(msg`Seats you bring`)}</MonoLabel>
            <SeatValue>{seats}</SeatValue>
          </SliderHeader>
          <Slider
            id="integrator-ledger-seats"
            max={maxSeats}
            min={minSeats}
            onChange={handleSeatsChange}
            step={INTEGRATOR_LEDGER.seatStep}
            style={{ '--progress': `${seatProgress * 100}%` } as CSSProperties}
            type="range"
            value={seats}
          />
        </SliderBlock>
        <Footer style={{ '--row': 4 } as CSSProperties}>
          <Footnote>
            {i18n._(
              msg`Estimate on the Organization plan at $${seatPricePerMonth} per seat per month, billed yearly.`,
            )}{' '}
            {footnote}
          </Footnote>
        </Footer>
      </Panel>
    </Stack>
  );
}
