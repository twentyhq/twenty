'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconBuilding, IconChartBar } from '@tabler/icons-react';

import { useAnimatedNumber } from '@/platform/motion';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  REDUCED_MOTION,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { STEP_CARD_CHROME } from './step-card-chrome';

const {
  Panel,
  PanelHeader,
  PanelNote,
  Row,
  RowLabel,
  RowValue,
  Stage,
  scrub,
  scrubTime,
  timelineDelay,
} = STEP_CARD_CHROME;

// The Earnings section's figures: 20% of the Organization seat price.
const SEAT_PRICE_USD = 39;
const COMMISSION_SHARE = 0.2;
const MONTH_COUNT = 12;

const CLIENTS = [
  { name: msg`Acme Corp`, seats: 40 },
  { name: msg`Northwind Studio`, seats: 25 },
  { name: msg`Globex`, seats: 10 },
];

// Each client's icon in one of the site's accents.
const CLIENT_TINTS = [color('green'), color('pink'), color('yellow')];

const commissionFor = (seats: number) =>
  Math.round(seats * SEAT_PRICE_USD * COMMISSION_SHARE);

const MONTHLY_TOTAL_USD = CLIENTS.reduce(
  (total, client) => total + commissionFor(client.seats),
  0,
);

const USD = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

// Rows land one after the other, then the months fill in. On scroll it
// follows the reader; when the stepper swipes it plays each time the step
// becomes active; reduced motion shows the panel done.
const ROW_STAGGER_MS = 180;
const MONTH_DELAY_MS = 700;
const MONTH_STAGGER_MS = 70;
const ROWS_MS = 2 * ROW_STAGGER_MS + 400;
const TIMELINE_MS = MONTH_DELAY_MS + MONTH_COUNT * MONTH_STAGGER_MS + 300;

const Period = styled(RowLabel)`
  margin-left: auto;
`;

const Total = styled.div`
  align-items: baseline;
  display: flex;
  gap: 10px;
  padding: 4px 8px 8px;
`;

const Figure = styled.span`
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: 40px;
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1;
`;

// Icon, client, seats, commission.
const ClientRow = styled(Row)`
  grid-template-columns: auto minmax(0, 1fr) auto auto;

  &[data-index='1'] {
    --d: ${ROW_STAGGER_MS}ms;
  }

  &[data-index='2'] {
    --d: ${2 * ROW_STAGGER_MS}ms;
  }

  [data-active] & {
    animation: commissionRow ${DURATION.lg} ${EASING.standard} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes commissionRow {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Amount = styled(RowValue)`
  color: ${color('green')};
  font-variant-numeric: tabular-nums;
`;

// One bar per month: the share is paid every month for a year.
const Months = styled.div`
  align-items: end;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(${MONTH_COUNT}, 1fr);
  height: 56px;
  padding: 8px 8px 0;
`;

const Month = styled.span`
  background: ${color('green')};
  border-radius: 2px;
  height: 100%;
  transform-origin: bottom;

  [data-active] & {
    animation: commissionMonth ${DURATION.md} ${EASING.standard} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes commissionMonth {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function CommissionStepVisual({
  active,
  progress,
}: {
  active: boolean;
  progress?: number;
}) {
  const { i18n } = useLingui();
  // Swiping: the total counts up on arrival. Scrolling: it follows the rows.
  const animatedTotal = useAnimatedNumber(active ? MONTHLY_TOTAL_USD : 0);
  const total =
    progress === undefined
      ? animatedTotal
      : Math.round(
          MONTHLY_TOTAL_USD *
            Math.min(1, scrubTime(progress, TIMELINE_MS) / ROWS_MS),
        );

  return (
    <Stage
      aria-hidden
      data-active={active ? '' : undefined}
      {...scrub(progress, TIMELINE_MS)}
    >
      <Panel>
        <PanelHeader>
          <IconChartBar size={20} stroke={1.5} />
          {i18n._(msg`Commission`)}
          <Period>{i18n._(msg`This month`)}</Period>
        </PanelHeader>
        <Total>
          <Figure>{USD.format(total)}</Figure>
          <RowLabel>{i18n._(msg`20% of seat revenue`)}</RowLabel>
        </Total>
        {CLIENTS.map(({ name, seats }, index) => (
          <ClientRow data-index={index} key={name.id}>
            <IconBuilding color={CLIENT_TINTS[index]} size={20} stroke={1.5} />
            <RowValue>{i18n._(name)}</RowValue>
            <RowLabel>{i18n._(msg`${seats} seats`)}</RowLabel>
            <Amount>{USD.format(commissionFor(seats))}</Amount>
          </ClientRow>
        ))}
        <Months>
          {Array.from({ length: MONTH_COUNT }, (_, monthIndex) => (
            <Month
              key={monthIndex}
              style={cssVariableStyle({
                '--d': `${MONTH_DELAY_MS + monthIndex * MONTH_STAGGER_MS}ms`,
              })}
            />
          ))}
        </Months>
        <Axis>
          <PanelNote>{i18n._(msg`Month 1`)}</PanelNote>
          <PanelNote>{i18n._(msg`Month 12`)}</PanelNote>
        </Axis>
      </Panel>
    </Stage>
  );
}
