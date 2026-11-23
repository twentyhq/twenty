'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from './step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage } = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const green = PRODUCT_STEPPER_SCENE.workflow.green;

const PARTNER_CODE = 'TWENTY-7F3K';

const StatusDot = styled.span`
  background: ${green};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const Status = styled.span`
  color: ${green};
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
`;

const CodeBox = styled.div`
  align-items: center;
  background: ${shell.cardBackground};
  border: 1px dashed ${shell.borderStrong};
  border-radius: 4px;
  color: ${shell.text};
  display: flex;
  font-family: ui-monospace, monospace;
  font-size: 16px;
  justify-content: space-between;
  letter-spacing: 0.08em;
  padding: 12px;
`;

const Copy = styled.span`
  color: ${shell.textSecondary};
  font-family: ${shell.font};
  font-size: 11px;
  letter-spacing: 0;
`;

export function PartnerCodeStepVisual({ active }: { active: boolean }) {
  const { i18n } = useLingui();

  return (
    <Stage aria-hidden data-active={active ? '' : undefined}>
      <Card>
        <CardHeader>
          <StatusDot />
          {i18n._(msg`Application approved`)}
          <Status>{i18n._(msg`Partner`)}</Status>
        </CardHeader>
        <CardBody>
          <Label>{i18n._(msg`Your partner code`)}</Label>
          <CodeBox>
            {PARTNER_CODE}
            <Copy>{i18n._(msg`Copy`)}</Copy>
          </CodeBox>
        </CardBody>
      </Card>
    </Stage>
  );
}
