'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties, useState } from 'react';

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

import { CREATOR_EARNINGS_MODEL } from './creator-earnings-model';
import { creatorNiceCeiling } from './creator-nice-ceiling';
import { useInView } from './use-in-view';

const MONTH_INDEXES = Array.from(
  { length: CREATOR_EARNINGS_MODEL.months },
  (_, index) => index,
);

const Band = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    align-items: end;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 4fr) minmax(0, 4fr) minmax(0, 5fr);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const SliderStack = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const SliderHead = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

const SliderLabel = styled.label`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const SliderValue = styled.output`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.04em;
  line-height: 1;
`;

// A flat track and a flat fill under a transparent native range input, which
// keeps keyboard and touch behaviour.
const SliderField = styled.div`
  margin-top: ${spacing(1)};
  position: relative;

  &::before {
    background-color: ${color('white-20')};
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 50%;
  }
`;

const SliderFill = styled.span`
  background-color: ${color('white')};
  height: 1px;
  left: 0;
  position: absolute;
  top: 50%;
  width: var(--creator-slider-fill);
`;

const Slider = styled.input`
  appearance: none;
  background: none;
  cursor: pointer;
  display: block;
  height: ${spacing(8)};
  position: relative;
  width: 100%;

  &::-webkit-slider-thumb {
    appearance: none;
    background-color: ${color('white')};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 ${spacing(1.5)} ${color('white-10')};
    height: ${spacing(4)};
    transition: box-shadow ${DURATION.xs} ${EASING.gentle};
    width: ${spacing(4)};
  }

  &::-moz-range-thumb {
    background-color: ${color('white')};
    border: none;
    border-radius: ${radius(1)};
    box-shadow: 0 0 0 ${spacing(1.5)} ${color('white-10')};
    height: ${spacing(4)};
    width: ${spacing(4)};
  }

  &:hover::-webkit-slider-thumb,
  &:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 ${spacing(2.5)} ${color('white-10')};
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 2px ${color('blue')};
  }

  &:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 2px ${color('blue')};
  }
`;

const Answer = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Caption = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Total = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(14)};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.03em;
  line-height: 1;

  ${mediaUp('md')} {
    font-size: ${fontSize(18)};
  }
`;

const Breakdown = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
`;

// Twelve months, cumulative, on a rounded scale shown on the top rule.
const Months = styled.ol`
  align-items: end;
  border-bottom: 1px solid ${semanticColor.lineStrong};
  border-top: 1px dashed ${semanticColor.line};
  column-gap: ${spacing(1)};
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  height: ${spacing(28)};
  list-style: none;
  padding: 0;
  position: relative;

  ${mediaUp('md')} {
    column-gap: ${spacing(1.5)};
  }
`;

const Month = styled.li`
  background-image: repeating-linear-gradient(
    to top,
    ${color('white-60')} 0,
    ${color('white-60')} 2px,
    transparent 2px,
    transparent ${spacing(1.5)}
  );
  height: 0;
  transition: height 700ms ${EASING.standard};
  transition-delay: calc(var(--creator-month-index) * 35ms);

  &:last-child {
    background-image: repeating-linear-gradient(
      to top,
      ${color('pink')} 0,
      ${color('pink')} 2px,
      transparent 2px,
      transparent ${spacing(1.5)}
    );
  }

  [data-revealed] & {
    height: calc(var(--creator-month-share) * 100%);
  }

  ${REDUCED_MOTION} {
    height: calc(var(--creator-month-share) * 100%);
    transition: none;
  }
`;

const CeilingLabel = styled.li`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-variant-numeric: tabular-nums;
  left: 0;
  letter-spacing: 0.04em;
  position: absolute;
  top: ${spacing(-6)};
`;

const MonthAxis = styled.div`
  color: ${semanticColor.inkSubtle};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  justify-content: space-between;
  letter-spacing: 0.04em;
  margin-top: ${spacing(2)};
  text-transform: uppercase;
`;

// PROTOTYPE the earnings estimate: inputs, the answer, its twelve months.
export function CreatorEstimator() {
  const { i18n } = useLingui();
  const [teams, setTeams] = useState(CREATOR_EARNINGS_MODEL.teams.initial);
  const [seatsPerTeam, setSeatsPerTeam] = useState(
    CREATOR_EARNINGS_MODEL.seatsPerTeam.initial,
  );
  const [bandRef, isInView] = useInView<HTMLDivElement>(0.3);

  const monthlyDollars =
    teams *
    seatsPerTeam *
    CREATOR_EARNINGS_MODEL.seatPriceDollars *
    CREATOR_EARNINGS_MODEL.commissionRate;
  const totalDollars = monthlyDollars * CREATOR_EARNINGS_MODEL.months;
  const ceilingDollars = creatorNiceCeiling(totalDollars);
  const displayedTotal = useAnimatedNumber(isInView ? totalDollars : 0);

  const formatDollars = (value: number) =>
    new Intl.NumberFormat(i18n.locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const sliders = [
    {
      id: 'creator-earnings-teams',
      label: i18n._(msg`Teams you bring`),
      range: CREATOR_EARNINGS_MODEL.teams,
      value: teams,
      onChange: setTeams,
    },
    {
      id: 'creator-earnings-seats',
      label: i18n._(msg`Seats per team`),
      range: CREATOR_EARNINGS_MODEL.seatsPerTeam,
      value: seatsPerTeam,
      onChange: setSeatsPerTeam,
    },
  ];

  return (
    <Band data-revealed={isInView ? '' : undefined} ref={bandRef}>
      <SliderStack>
        {sliders.map((slider) => {
          const fillPercent =
            ((slider.value - slider.range.min) /
              (slider.range.max - slider.range.min)) *
            100;

          return (
            <div key={slider.id}>
              <SliderHead>
                <SliderLabel htmlFor={slider.id}>{slider.label}</SliderLabel>
                <SliderValue htmlFor={slider.id}>{slider.value}</SliderValue>
              </SliderHead>
              <SliderField
                style={
                  {
                    '--creator-slider-fill': `${fillPercent}%`,
                  } as CSSProperties
                }
              >
                <SliderFill aria-hidden />
                <Slider
                  id={slider.id}
                  max={slider.range.max}
                  min={slider.range.min}
                  onChange={(event) =>
                    slider.onChange(Number(event.target.value))
                  }
                  step={1}
                  type="range"
                  value={slider.value}
                />
              </SliderField>
            </div>
          );
        })}
      </SliderStack>
      <Answer>
        <Caption>{i18n._(msg`Your first year`)}</Caption>
        <Total aria-live="polite">{formatDollars(displayedTotal)}</Total>
        <Breakdown>
          {`${teams} × ${seatsPerTeam} × ${formatDollars(
            CREATOR_EARNINGS_MODEL.seatPriceDollars,
          )} × 20% × ${CREATOR_EARNINGS_MODEL.months}`}
        </Breakdown>
      </Answer>
      <div>
        <Months aria-hidden>
          <CeilingLabel>{formatDollars(ceilingDollars)}</CeilingLabel>
          {MONTH_INDEXES.map((monthIndex) => (
            <Month
              key={monthIndex}
              style={
                {
                  '--creator-month-index': monthIndex,
                  '--creator-month-share':
                    (monthlyDollars * (monthIndex + 1)) / ceilingDollars,
                } as CSSProperties
              }
            />
          ))}
        </Months>
        <MonthAxis aria-hidden>
          <span>{i18n._(msg`Month 1`)}</span>
          <span>{i18n._(msg`Month 12`)}</span>
        </MonthAxis>
      </div>
    </Band>
  );
}
