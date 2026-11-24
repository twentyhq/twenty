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
const accent = PRODUCT_STEPPER_SCENE.layout.accent;
const green = PRODUCT_STEPPER_SCENE.workflow.green;

// ApplyStepVisual's sequence: each value types in after the previous one,
// then the form is sent. On scroll the sequence follows the reader; when the
// stepper swipes it plays each time the step becomes active; reduced motion
// shows the filled form.
const TYPE_STAGGER_MS = 550;
const TYPE_DURATION_MS = 500;
const SEND_DELAY_MS = 3 * TYPE_STAGGER_MS + 300;
const TIMELINE_MS = SEND_DELAY_MS + 300;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// The field being typed in takes the accent border, like a focused input.
const Input = styled.div`
  background: ${shell.cardBackground};
  border: 1px solid ${shell.borderMedium};
  border-radius: 4px;
  min-height: 38px;
  padding: 8px 12px;

  &[data-index='1'] {
    --d: ${TYPE_STAGGER_MS}ms;
  }

  &[data-index='2'] {
    --d: ${2 * TYPE_STAGGER_MS}ms;
  }

  [data-active] & {
    animation: creatorApplyFocus ${TYPE_DURATION_MS}ms step-end forwards;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFocus {
    0% {
      border-color: ${accent};
    }
    100% {
      border-color: ${shell.borderMedium};
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

// Typed in: the value is uncovered left to right in steps, like keystrokes.
const Typed = styled.span`
  display: inline-block;

  [data-active] & {
    animation: creatorApplyType ${TYPE_DURATION_MS}ms steps(16, end) both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyType {
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

// The button holds both labels in one cell and crossfades Submit to Sent.
const SubmitButton = styled.div`
  align-self: flex-end;
  background: ${accent};
  border-radius: 4px;
  color: ${shell.background};
  display: grid;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;

  --d: ${SEND_DELAY_MS}ms;

  & > span {
    grid-area: 1 / 1;
    text-align: center;
  }

  [data-active] & {
    animation: creatorApplySent ${DURATION.md} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplySent {
    to {
      background: ${green};
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const SubmitLabel = styled.span`
  [data-active] & {
    animation: creatorApplyFadeOut ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFadeOut {
    to {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const SentLabel = styled.span`
  opacity: 0;

  [data-active] & {
    animation: creatorApplyFadeIn ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFadeIn {
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

// The creator form's own labels (affiliate-application-copy), filled in.
const FIELDS = [
  { label: msg`Main channel (URL)`, value: msg`youtube.com/@yourname` },
  {
    label: msg`Audience size or clients`,
    value: msg`12k newsletter subscribers`,
  },
  {
    label: msg`How you plan to promote Twenty`,
    value: msg`Reviews, tutorials, migration guides`,
  },
];

export function CreatorApplyStepVisual({
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
      data-anchor="corner"
      {...scrub(progress, TIMELINE_MS)}
    >
      <Card>
        <CardHeader>{i18n._(msg`Creator application`)}</CardHeader>
        <CardBody>
          {FIELDS.map(({ label, value }, index) => (
            <FormField key={label.id}>
              <Label>{i18n._(label)}</Label>
              <Input data-index={index}>
                <Value>
                  <Typed>{i18n._(value)}</Typed>
                </Value>
              </Input>
            </FormField>
          ))}
          <SubmitButton>
            <SubmitLabel>{i18n._(msg`Submit application`)}</SubmitLabel>
            <SentLabel>{i18n._(msg`Sent`)}</SentLabel>
          </SubmitButton>
        </CardBody>
      </Card>
    </Stage>
  );
}
