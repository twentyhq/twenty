'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { DURATION, EASING, REDUCED_MOTION } from '@/tokens';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEP_CARD_CHROME } from './step-card-chrome';

const { Card, CardBody, CardHeader, Label, Stage, scrub, timelineDelay } =
  STEP_CARD_CHROME;
const shell = PRODUCT_STEPPER_SCENE.shell;
const green = PRODUCT_STEPPER_SCENE.workflow.green;

const PARTNER_CODE = 'TWENTY-7F3K';

// The approval lands, the code types out one character at a time, then it
// is copied. On scroll it follows the reader; when the stepper swipes it
// plays each time the step becomes active; reduced motion shows the card done.
const CODE_DELAY_MS = 400;
const CODE_DURATION_MS = 900;
const COPY_DELAY_MS = CODE_DELAY_MS + CODE_DURATION_MS + 400;
const TIMELINE_MS = COPY_DELAY_MS + 300;

const StatusDot = styled.span`
  background: ${green};
  border-radius: 50%;
  height: 8px;
  width: 8px;

  [data-active] & {
    animation: codePulse 1.6s ${EASING.gentle} 2;
  }

  @keyframes codePulse {
    0% {
      box-shadow: 0 0 0 0 ${green};
    }
    100% {
      box-shadow: 0 0 0 8px transparent;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Status = styled.span`
  color: ${green};
  font-size: 13px;
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
  font-size: 20px;
  justify-content: space-between;
  letter-spacing: 0.08em;
  padding: 16px;
`;

// Monospace, so each step of the reveal uncovers exactly one character.
const CodeText = styled.span`
  --d: ${CODE_DELAY_MS}ms;

  [data-active] & {
    animation: codeType ${CODE_DURATION_MS}ms steps(${PARTNER_CODE.length}, end)
      both;
    animation-delay: ${timelineDelay};
  }

  @keyframes codeType {
    from {
      clip-path: inset(0 100% 0 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

// Both labels share one cell; Copy crossfades to Copied.
const CopyAction = styled.span`
  --d: ${COPY_DELAY_MS}ms;
  display: grid;
  font-family: ${shell.font};
  font-size: 13px;
  letter-spacing: 0;

  & > span {
    grid-area: 1 / 1;
    text-align: right;
  }
`;

const CopyLabel = styled.span`
  color: ${shell.textSecondary};

  [data-active] & {
    animation: codeHide ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes codeHide {
    to {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const CopiedLabel = styled.span`
  color: ${green};
  opacity: 0;

  [data-active] & {
    animation: codeShow ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes codeShow {
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

export function PartnerCodeStepVisual({
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
        <CardHeader>
          <StatusDot />
          {i18n._(msg`Application approved`)}
          <Status>{i18n._(msg`Partner`)}</Status>
        </CardHeader>
        <CardBody>
          <Label>{i18n._(msg`Your partner code`)}</Label>
          <CodeBox>
            <CodeText>{PARTNER_CODE}</CodeText>
            <CopyAction>
              <CopyLabel>{i18n._(msg`Copy`)}</CopyLabel>
              <CopiedLabel>{i18n._(msg`Copied`)}</CopiedLabel>
            </CopyAction>
          </CodeBox>
        </CardBody>
      </Card>
    </Stage>
  );
}
