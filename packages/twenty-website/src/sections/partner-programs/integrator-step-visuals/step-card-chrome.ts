import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const shell = PRODUCT_STEPPER_SCENE.shell;

// The product stepper's light-window fiction: one card centred in the frame.
const Stage = styled.div`
  align-items: center;
  display: flex;
  font-family: ${shell.font};
  height: 100%;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s;
  width: 100%;

  &[data-active] {
    opacity: 1;
  }
`;

const Card = styled.div`
  background: ${shell.background};
  border: 1px solid ${shell.borderMedium};
  border-radius: 8px;
  box-shadow: ${PRODUCT_STEPPER_SCENE.cardShadow};
  display: flex;
  flex-direction: column;
  max-width: 360px;
  width: 86%;
`;

const CardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${shell.borderLight};
  color: ${shell.text};
  display: flex;
  font-size: 13px;
  font-weight: 500;
  gap: 8px;
  padding: 12px 16px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const Label = styled.span`
  color: ${shell.textTertiary};
  font-size: 11px;
  font-weight: 500;
`;

const Value = styled.span`
  color: ${shell.text};
  font-size: 12px;
`;

export const STEP_CARD_CHROME = {
  Card,
  CardBody,
  CardHeader,
  Label,
  Stage,
  Value,
};
