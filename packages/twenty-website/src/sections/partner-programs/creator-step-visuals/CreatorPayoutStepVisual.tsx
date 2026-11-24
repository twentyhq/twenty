'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { DURATION, EASING, REDUCED_MOTION } from '@/tokens';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const {
  Card,
  CardBody,
  CardHeader,
  Label,
  Stage,
  Value,
  scrub,
  timelineDelay,
} = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const green = PRODUCT_STEPPER_SCENE.workflow.green;

// Fictional amounts; the rules (monthly, from $50, 30-day hold) are the FAQ's.
const PAYOUTS = [
  { month: msg`October`, amount: '$64.00', isPaid: true },
  { month: msg`November`, amount: '$82.40', isPaid: true },
  { month: msg`December`, amount: '$96.00', isPaid: false },
];

// CommissionStepVisual's rows: the months land one after the other, each
// paid status shows once its row is in, then the rules. On scroll it follows
// the reader; when the stepper swipes it plays each time the step becomes
// active; reduced motion shows the card done.
// Kept apart from PAYOUTS: Linaria evaluates these timings at build time,
// and PAYOUTS holds Lingui macros it cannot run.
const ROW_COUNT = 3;
const ROW_STAGGER_MS = 350;
const STATUS_LAG_MS = 250;
const RULES_DELAY_MS = ROW_COUNT * ROW_STAGGER_MS + 300;
const TIMELINE_MS = RULES_DELAY_MS + 400;

const Row = styled.div`
  align-items: center;
  border-bottom: 1px solid ${shell.borderLight};
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr auto auto;
  padding-bottom: 12px;

  &[data-index='1'] {
    --d: ${ROW_STAGGER_MS}ms;
  }

  &[data-index='2'] {
    --d: ${2 * ROW_STAGGER_MS}ms;
  }

  [data-active] & {
    animation: creatorPayoutRow ${DURATION.lg} ${EASING.standard} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorPayoutRow {
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

// The status lands just after its row, as the payout clears.
const Status = styled.span`
  color: ${shell.textTertiary};
  font-size: 13px;
  font-weight: 500;
  min-width: 72px;
  text-align: right;

  &[data-paid] {
    color: ${green};
  }

  [data-active] & {
    animation: creatorPayoutStatus ${DURATION.md} ${EASING.gentle} both;
    animation-delay: calc(${timelineDelay} + ${STATUS_LAG_MS}ms);
  }

  @keyframes creatorPayoutStatus {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Rules = styled.div`
  --d: ${RULES_DELAY_MS}ms;

  [data-active] & {
    animation: creatorPayoutRules ${DURATION.md} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorPayoutRules {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

export function CreatorPayoutStepVisual({
  active,
  progress,
}: {
  active: boolean;
  progress?: number;
}) {
  const { i18n } = useLingui();

  return (
    <Stage
      aria-hidden
      data-active={active ? '' : undefined}
      {...scrub(progress, TIMELINE_MS)}
    >
      <Card>
        <CardHeader>{i18n._(msg`Payouts`)}</CardHeader>
        <CardBody>
          {PAYOUTS.map(({ month, amount, isPaid }, index) => (
            <Row data-index={index} key={month.id}>
              <Value>{i18n._(month)}</Value>
              <Value>{amount}</Value>
              <Status data-paid={isPaid ? '' : undefined}>
                {isPaid ? i18n._(msg`Paid`) : i18n._(msg`Scheduled`)}
              </Status>
            </Row>
          ))}
          <Rules>
            <Label>{i18n._(msg`Monthly from $50, after a 30-day hold`)}</Label>
          </Rules>
        </CardBody>
      </Card>
    </Stage>
  );
}
