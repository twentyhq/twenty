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
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { IntegratorCoinPile } from './IntegratorCoinPile';
import { INTEGRATOR_LEDGER } from './integrator-ledger-config';

const READOUT_ENTRANCE_DELAY_MS = 900;
const SCALE_MARKS = [5, 100, 200, 300] as const;

// No frame: the calculator is the section's content, not a widget in it.
const Panel = styled.div`
  position: relative;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  /* Wide: the seats and what they earn on the left, the coins on the
     right. */
  @container (min-width: 880px) {
    align-items: stretch;
    display: grid;
    gap: ${spacing(16)};
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);

    & > * + * {
      margin-top: 0;
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

// The section's figure, at the home hero's size.
const ReadoutValue = styled.output`
  ${typeRampDeclarations('headingXl')}
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('serif')};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
`;

// The seats, what they earn, then the footnote at the column's foot.
const FiguresColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};

  & > :last-child {
    margin-top: auto;
  }
`;

// The seat count rides the slider's thumb: one control, its value where the
// hand is. The track keeps the thumb's half width at each end, so the count
// sits over it at every value.
const SliderTrack = styled.div`
  --thumb: 16px;
  padding-top: ${spacing(12)};
  position: relative;
`;

const ThumbValue = styled.output`
  ${typeRampDeclarations('headingSm')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.medium};
  left: calc(var(--thumb) / 2 + var(--share) * (100% - var(--thumb)));
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  white-space: nowrap;
`;

// Where the scale's marks fall, as shares of the track.
const Scale = styled.div`
  ${typeRampDeclarations('bodyXs')}
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-variant-numeric: tabular-nums;
  height: ${spacing(5)};
  margin-top: ${spacing(2)};
  position: relative;

  & > span {
    left: calc(var(--thumb) / 2 + var(--share) * (100% - var(--thumb)));
    position: absolute;
    transform: translateX(-50%);
  }

  & > span:first-child {
    transform: translateX(calc(-1 * var(--thumb) / 2));
  }

  & > span:last-child {
    transform: translateX(calc(-100% + var(--thumb) / 2));
  }
`;

const SliderBlock = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// The Field label recipe, on a <label> so it targets the slider.
// The column's labels, at body size so they hold their own next to the
// figures.
const SliderHeader = styled.label`
  ${typeRampDeclarations('bodyMd')}
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const ReadoutLabel = styled.p`
  ${typeRampDeclarations('bodyMd')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const ReadoutHint = styled.p`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
`;

const Readout = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
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

// How high the coins pile: eased so a small book still shows a few.
const pileFill = (seats: number): number => {
  const { minSeats, maxSeats } = INTEGRATOR_LEDGER;
  const seatProgress = (seats - minSeats) / (maxSeats - minSeats);

  return 0.12 + 0.88 * seatProgress ** 0.6;
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
  const scaleShare = (value: number) =>
    (value - minSeats) / (maxSeats - minSeats);

  return (
    <Stack>
      <Panel>
        <FiguresColumn style={cssVariableStyle({ '--row': 0 })}>
          <SliderBlock>
            <SliderHeader htmlFor="integrator-ledger-seats">
              {i18n._(msg`Seats you bring`)}
            </SliderHeader>
            <SliderTrack style={cssVariableStyle({ '--share': seatProgress })}>
              <ThumbValue htmlFor="integrator-ledger-seats">{seats}</ThumbValue>
              <Slider
                id="integrator-ledger-seats"
                max={maxSeats}
                min={minSeats}
                onChange={handleSeatsChange}
                step={INTEGRATOR_LEDGER.seatStep}
                style={cssVariableStyle({
                  '--progress': `${seatProgress * 100}%`,
                })}
                type="range"
                value={seats}
              />
              <Scale aria-hidden>
                {SCALE_MARKS.map((mark) => (
                  <span
                    key={mark}
                    style={cssVariableStyle({ '--share': scaleShare(mark) })}
                  >
                    {mark}
                  </span>
                ))}
              </Scale>
            </SliderTrack>
          </SliderBlock>
          <Readout>
            <ReadoutLabel>{i18n._(msg`Your commission`)}</ReadoutLabel>
            <ReadoutValue aria-live="polite" htmlFor="integrator-ledger-seats">
              {currency.format(shownCommission)}
            </ReadoutValue>
            <ReadoutHint>
              {i18n._(
                msg`${seats} seats × $${seatPricePerMonth} a month × ${Math.round(commissionRate * 100)}% × ${months} months`,
              )}
            </ReadoutHint>
          </Readout>
          <Footnote>
            {i18n._(
              msg`Estimate on the Organization plan at $${seatPricePerMonth} per seat per month, billed yearly.`,
            )}{' '}
            {footnote}
          </Footnote>
        </FiguresColumn>
        <div style={cssVariableStyle({ '--row': 1 })}>
          <IntegratorCoinPile fill={pileFill(seats)} />
        </div>
      </Panel>
    </Stack>
  );
}
