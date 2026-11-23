'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage, Value } = STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;

// Fictional link: the real format comes from the program, not this page.
const CREATOR_LINK = 'twenty.com/?via=yourname';

const LinkBox = styled.div`
  align-items: center;
  background: ${shell.cardBackground};
  border: 1px dashed ${shell.borderStrong};
  border-radius: 4px;
  color: ${shell.text};
  display: flex;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  justify-content: space-between;
  padding: 12px;
`;

const Copy = styled.span`
  color: ${shell.textSecondary};
  font-family: ${shell.font};
  font-size: 11px;
`;

const Row = styled.div`
  align-items: center;
  border-top: 1px solid ${shell.borderLight};
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
`;

export function CreatorLinkStepVisual({ active }: { active: boolean }) {
  const { i18n } = useLingui();

  return (
    <Stage aria-hidden data-active={active ? '' : undefined}>
      <Card>
        <CardHeader>{i18n._(msg`Your creator link`)}</CardHeader>
        <CardBody>
          <LinkBox>
            {CREATOR_LINK}
            <Copy>{i18n._(msg`Copy`)}</Copy>
          </LinkBox>
          <Row>
            <Label>{i18n._(msg`Signups credited after a click`)}</Label>
            <Value>{i18n._(msg`30 days`)}</Value>
          </Row>
        </CardBody>
      </Card>
    </Stage>
  );
}
