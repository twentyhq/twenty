'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { useAnimatedNumber } from '@/platform/motion';
import { DURATION, EASING, REDUCED_MOTION } from '@/tokens';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { STEP_CARD_CHROME } from './step-card-chrome';

const {
  Card,
  CardBody,
  CardHeader,
  Label,
  Stage,
  scrub,
  scrubTime,
  timelineDelay,
} = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const accent = PRODUCT_STEPPER_SCENE.layout.accent;

// The Earnings section's figures: 20% of the Organization seat price.
const SEAT_PRICE_USD = 39;
const COMMISSION_SHARE = 0.2;
const MONTH_COUNT = 12;

const CLIENTS = [
  { name: msg`Acme Corp`, seats: 40 },
  { name: msg`Northwind Studio`, seats: 25 },
  { name: msg`Globex`, seats: 10 },
];

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
// becomes active; reduced motion shows the card done.
const ROW_STAGGER_MS = 180;
const MONTH_DELAY_MS = 700;
const MONTH_STAGGER_MS = 70;
const ROWS_MS = 2 * ROW_STAGGER_MS + 400;
const TIMELINE_MS = MONTH_DELAY_MS + MONTH_COUNT * MONTH_STAGGER_MS + 300;

const Period = styled.span`
  color: ${shell.textTertiary};
  font-size: 13px;
  font-weight: 400;
  margin-left: auto;
`;

const Total = styled.div`
  align-items: baseline;
  display: flex;
  gap: 8px;
`;

const Figure = styled.span`
  color: ${shell.text};
  font-size: 40px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1;
`;

const Rows = styled.ul`
  border-top: 1px solid ${shell.borderLight};
  list-style: none;
  padding: 0;
`;

const Row = styled.li`
  align-items: center;
  border-bottom: 1px solid ${shell.borderLight};
  color: ${shell.text};
  display: grid;
  font-size: 14px;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 10px 0;

  &:nth-child(2) {
    --d: ${ROW_STAGGER_MS}ms;
  }

  &:nth-child(3) {
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

const Seats = styled.span`
  color: ${shell.textTertiary};
  font-size: 13px;
`;

const Amount = styled.span`
  color: ${accent};
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`;

// One bar per month: the share is paid every month for a year.
const Months = styled.div`
  align-items: end;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(${MONTH_COUNT}, 1fr);
  height: 72px;
`;

const Month = styled.span`
  background: ${accent};
  border-radius: 2px;
  height: 100%;
  opacity: 0.85;
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
      data-anchor="corner"
      {...scrub(progress, TIMELINE_MS)}
    >
      <Card>
        <CardHeader>
          {i18n._(msg`Commission`)}
          <Period>{i18n._(msg`This month`)}</Period>
        </CardHeader>
        <CardBody>
          <Total>
            <Figure>{USD.format(total)}</Figure>
            <Label>{i18n._(msg`20% of seat revenue`)}</Label>
          </Total>
          <Rows>
            {CLIENTS.map(({ name, seats }) => (
              <Row key={name.id}>
                <span>{i18n._(name)}</span>
                <Seats>{i18n._(msg`${seats} seats`)}</Seats>
                <Amount>{USD.format(commissionFor(seats))}</Amount>
              </Row>
            ))}
          </Rows>
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
            <Label>{i18n._(msg`Month 1`)}</Label>
            <Label>{i18n._(msg`Month 12`)}</Label>
          </Axis>
        </CardBody>
      </Card>
    </Stage>
  );
}
