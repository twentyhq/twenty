'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconCalendar, IconCash } from '@tabler/icons-react';

import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const {
  Panel,
  PanelHeader,
  PanelNote,
  Row,
  RowLabel,
  RowValue,
  Stage,
  scrub,
  timelineDelay,
} = STEP_CARD_CHROME;

// Fictional amounts; the rules (monthly, from $50, 30-day hold) are the FAQ's.
const PAYOUTS = [
  { month: msg`October`, amount: '$64.00', isPaid: true },
  { month: msg`November`, amount: '$82.40', isPaid: true },
  { month: msg`December`, amount: '$96.00', isPaid: false },
];

// CommissionStepVisual's rows: the months land one after the other, each
// paid status shows once its row is in, then the rules. On scroll it follows
// the reader; when the stepper swipes it plays each time the step becomes
// active; reduced motion shows the panel done.
// Kept apart from PAYOUTS: Linaria evaluates these timings at build time,
// and PAYOUTS holds Lingui macros it cannot run.
const ROW_COUNT = 3;
const ROW_STAGGER_MS = 350;
const STATUS_LAG_MS = 250;
const RULES_DELAY_MS = ROW_COUNT * ROW_STAGGER_MS + 300;
const TIMELINE_MS = RULES_DELAY_MS + 400;

// Icon, month, amount, status.
const PayoutRow = styled(Row)`
  grid-template-columns: auto minmax(0, 1fr) auto 88px;

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
const Status = styled(RowLabel)`
  text-align: right;

  &[data-paid] {
    color: ${color('green')};
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

const Rules = styled(PanelNote)`
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
      opacity: 0.7;
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
      <Panel>
        <PanelHeader>
          <IconCash size={20} stroke={1.5} />
          {i18n._(msg`Payouts`)}
        </PanelHeader>
        {PAYOUTS.map(({ month, amount, isPaid }, index) => (
          <PayoutRow data-index={index} key={month.id}>
            <IconCalendar
              color={isPaid ? color('green') : color('silver')}
              size={20}
              stroke={1.5}
            />
            <RowValue>{i18n._(month)}</RowValue>
            <RowValue>{amount}</RowValue>
            <Status data-paid={isPaid ? '' : undefined}>
              {isPaid ? i18n._(msg`Paid`) : i18n._(msg`Scheduled`)}
            </Status>
          </PayoutRow>
        ))}
        <Rules>{i18n._(msg`Monthly from $50, after a 30-day hold`)}</Rules>
      </Panel>
    </Stage>
  );
}
