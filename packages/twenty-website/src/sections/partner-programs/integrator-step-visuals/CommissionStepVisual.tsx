'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from './step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage } = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const accent = PRODUCT_STEPPER_SCENE.layout.accent;

const MONTH_COUNT = 12;

const Figure = styled.span`
  color: ${shell.text};
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
`;

// Twelve equal bars: the share holds every month for a year.
const Bars = styled.div`
  align-items: end;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(${MONTH_COUNT}, 1fr);
  height: 48px;
`;

const Bar = styled.span`
  background: ${accent};
  border-radius: 2px;
  height: 100%;
  opacity: 0.85;
`;

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function CommissionStepVisual({ active }: { active: boolean }) {
  const { i18n } = useLingui();

  return (
    <Stage aria-hidden data-active={active ? '' : undefined}>
      <Card>
        <CardHeader>{i18n._(msg`Commission`)}</CardHeader>
        <CardBody>
          <Figure>{i18n._(msg`20%`)}</Figure>
          <Label>{i18n._(msg`of seat revenue, per client`)}</Label>
          <Bars>
            {Array.from({ length: MONTH_COUNT }, (_, monthIndex) => (
              <Bar key={monthIndex} />
            ))}
          </Bars>
          <Axis>
            <Label>{i18n._(msg`Month 1`)}</Label>
            <Label>{i18n._(msg`Month 12`)}</Label>
          </Axis>
        </CardBody>
      </Card>
    </Stage>
  );
}
