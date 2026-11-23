'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from './step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage, Value } = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Input = styled.div`
  background: ${shell.cardBackground};
  border: 1px solid ${shell.borderMedium};
  border-radius: 4px;
  padding: 6px 8px;
`;

const SubmitButton = styled.div`
  align-self: flex-end;
  background: ${PRODUCT_STEPPER_SCENE.layout.accent};
  border-radius: 4px;
  color: ${shell.background};
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
`;

const FIELDS = [
  { label: msg`Company`, value: msg`Northwind Studio` },
  { label: msg`Clients on Twenty`, value: msg`12` },
  { label: msg`What you built`, value: msg`Custom objects, workflows, an app` },
];

export function ApplyStepVisual({ active }: { active: boolean }) {
  const { i18n } = useLingui();

  return (
    <Stage aria-hidden data-active={active ? '' : undefined}>
      <Card>
        <CardHeader>{i18n._(msg`Partner application`)}</CardHeader>
        <CardBody>
          {FIELDS.map(({ label, value }) => (
            <FormField key={label.id}>
              <Label>{i18n._(label)}</Label>
              <Input>
                <Value>{i18n._(value)}</Value>
              </Input>
            </FormField>
          ))}
          <SubmitButton>{i18n._(msg`Submit`)}</SubmitButton>
        </CardBody>
      </Card>
    </Stage>
  );
}
