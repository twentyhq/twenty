'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage, Value } = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const green = PRODUCT_STEPPER_SCENE.workflow.green;

// Fictional amounts; the rules (monthly, from $50, 30-day hold) are the FAQ's.
const PAYOUTS = [
  { month: msg`October`, amount: '$64.00', isPaid: true },
  { month: msg`November`, amount: '$82.40', isPaid: true },
  { month: msg`December`, amount: '$96.00', isPaid: false },
];

const Row = styled.div`
  align-items: center;
  border-bottom: 1px solid ${shell.borderLight};
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr auto auto;
  padding-bottom: 12px;
`;

const Status = styled.span`
  color: ${shell.textTertiary};
  font-size: 11px;
  font-weight: 500;
  min-width: 64px;
  text-align: right;

  &[data-paid] {
    color: ${green};
  }
`;

export function CreatorPayoutStepVisual({ active }: { active: boolean }) {
  const { i18n } = useLingui();

  return (
    <Stage aria-hidden data-active={active ? '' : undefined}>
      <Card>
        <CardHeader>{i18n._(msg`Payouts`)}</CardHeader>
        <CardBody>
          {PAYOUTS.map(({ month, amount, isPaid }) => (
            <Row key={month.id}>
              <Value>{i18n._(month)}</Value>
              <Value>{amount}</Value>
              <Status data-paid={isPaid ? '' : undefined}>
                {isPaid ? i18n._(msg`Paid`) : i18n._(msg`Scheduled`)}
              </Status>
            </Row>
          ))}
          <Label>{i18n._(msg`Monthly from $50, after a 30-day hold`)}</Label>
        </CardBody>
      </Card>
    </Stage>
  );
}
