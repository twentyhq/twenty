'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react';

import { useAnimatedNumber } from '@/platform/motion';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  color,
  DURATION,
  mediaUp,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  paletteColorNumber,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { INTEGRATOR_LEDGER } from './integrator-ledger-config';
import { INTEGRATOR_LEVEL_MODELS } from './integrator-level-models';

const READOUT_ENTRANCE_DELAY_MS = 900;
// The home's money model, drawn with the level cards' recipe so the page
// keeps one halftone: blue bands on white, lit per object. The pile holds
// in one pose; its dashes swell under the pointer.
const MONEY_MODEL_SETTINGS = {
  ...INTEGRATOR_LEVEL_MODELS[0].settings,
  previewDistance: 11,
  // a harder light, so each coin's top and rim part from its neighbours
  lighting: {
    intensity: 2.4,
    fillIntensity: 0.1,
    ambientIntensity: 0.05,
    angleDegrees: 132,
    height: 3.4,
  },
  // the Creators audience models' grain: coarse, crisp dashes
  halftone: {
    variant: 'band' as const,
    scale: 6,
    power: 0.16,
    width: 0.62,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  animation: {
    ...INTEGRATOR_LEVEL_MODELS[0].settings.animation,
    autoRotateEnabled: false,
    autoWobble: 0,
    followDragEnabled: false,
    hoverHalftoneEnabled: true,
    hoverHalftoneRadius: 0.22,
    hoverHalftonePowerShift: 0.5,
    hoverHalftoneWidthShift: 0.4,
  },
};

// One coin's size in the scene, small enough for the full pile to fit.
const PILE_COIN_SIZE = { scaleTarget: 0.75 };

// The pile: a mound of stacks on a honeycomb, tallest in the middle and
// running down to single coins at the rim, all coins facing the same way.
const PILE_RINGS = 2;
const PILE_PEAK = 5;
const PILE_PITCH = 1.2;

// A fixed scatter, so the server and the browser draw the same pile.
const scatter = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const PILE_STACKS = Array.from(
  { length: 2 * PILE_RINGS + 1 },
  (_, rowIndex) => rowIndex - PILE_RINGS,
)
  .flatMap((row) =>
    Array.from(
      { length: 2 * PILE_RINGS + 1 },
      (_, column) => column - PILE_RINGS,
    )
      .filter((column) => Math.abs(row + column) <= PILE_RINGS)
      .map((column, index) => {
        const x = (column + row / 2) * PILE_PITCH;
        const z = row * PILE_PITCH * 0.866;
        const reach = Math.hypot(x, z) / (PILE_RINGS * PILE_PITCH);
        const seed = (row + 7) * 31 + index;

        return {
          height: Math.max(
            1,
            Math.round(
              PILE_PEAK * Math.sqrt(1 - reach ** 2) + scatter(seed) * 0.9,
            ),
          ),
          x: x + (scatter(seed + 1) - 0.5) * 0.2,
          z: z + (scatter(seed + 2) - 0.5) * 0.2,
        };
      }),
  )
  // centre first, so each layer spreads out from the middle
  .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));

// Copies in the order they show: a layer across every stack, then the next
// one up, so the mound rises as a whole.
const PILE_PLACEMENTS = Array.from(
  { length: Math.max(...PILE_STACKS.map((stack) => stack.height)) },
  (_, level) =>
    PILE_STACKS.filter((stack) => level < stack.height).map((stack) => ({
      x: stack.x,
      // a coin's box runs a little taller than the coin: close the gap
      y: level * 0.88,
      z: stack.z,
    })),
).flat();

// How much of the pile shows: eased so a small book still shows a few.
const pileFill = (seats: number): number => {
  const { minSeats, maxSeats } = INTEGRATOR_LEDGER;
  const seatProgress = (seats - minSeats) / (maxSeats - minSeats);

  return 0.1 + 0.9 * seatProgress ** 0.6;
};
const SCALE_MARKS = [5, 100, 200, 300] as const;

// No frame: the calculator is the section's content, not a widget in it.
const Panel = styled.div`
  position: relative;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  /* Wide: the intro on the left, the seats and the footnote at its foot;
     the coins and what they come to on the right, from the heading down. */
  @container (min-width: 880px) {
    column-gap: ${spacing(16)};
    display: grid;
    grid-template-areas:
      'intro simulator'
      'note simulator';
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    grid-template-rows: auto 1fr;

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

const IntroArea = styled.div`
  grid-area: intro;
`;

// The coins, and what they come to right under them, centred in the
// section's height.
const SimulatorColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  justify-content: center;
  grid-area: simulator;
`;

const ModelFrame = styled.div`
  height: 270px;
  width: 100%;

  ${mediaUp('md')} {
    height: 460px;
  }
`;

// The seats, at the foot of the column level with the commission, and the
// footnote that qualifies them.
const NoteArea = styled.div`
  align-self: end;
  grid-area: note;

  & > * + * {
    margin-top: ${spacing(8)};
  }

  @container (min-width: 880px) {
    margin-top: ${spacing(16)};
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
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-variant-numeric: tabular-nums;
  height: ${spacing(6)};
  margin-top: ${spacing(3)};
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

// The page's sub-block title (the level cards' heading: sans, xs, medium),
// on a <label> so it targets the slider; the commission's label matches.
const SliderHeader = styled.label`
  ${typeRampDeclarations('headingXs')}
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const ReadoutLabel = styled.p`
  ${typeRampDeclarations('headingXs')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const ReadoutHint = styled.p`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
`;

// Centred under the coins it counts.
const Readout = styled.div`
  text-align: center;

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

// The same voice as the sum under the figure.
const Footnote = styled.p`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
`;

type IntegratorLedgerProps = {
  footnote: string;
  intro: ReactNode;
};

// Seats in, twelve months of commission out.
export function IntegratorLedger({ footnote, intro }: IntegratorLedgerProps) {
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
        <IntroArea style={cssVariableStyle({ '--row': 0 })}>{intro}</IntroArea>
        <SimulatorColumn style={cssVariableStyle({ '--row': 1 })}>
          <ModelFrame>
            <HalftoneModel
              geometryOptions={PILE_COIN_SIZE}
              modelUrl="/models/money.glb"
              settings={MONEY_MODEL_SETTINGS}
              stack={{
                placements: PILE_PLACEMENTS,
                tilt: 0.5,
                visible: Math.round(pileFill(seats) * PILE_PLACEMENTS.length),
              }}
            />
          </ModelFrame>
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
        </SimulatorColumn>
        <NoteArea style={cssVariableStyle({ '--row': 2 })}>
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
          <Footnote>
            {i18n._(
              msg`Estimate on the Organization plan at $${seatPricePerMonth} per seat per month, billed yearly.`,
            )}{' '}
            {footnote}
          </Footnote>
        </NoteArea>
      </Panel>
    </Stack>
  );
}
