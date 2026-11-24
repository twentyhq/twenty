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

// Fictional link: the real format comes from the program, not this page.
const CREATOR_LINK = 'twenty.com/?via=yourname';

// PartnerCodeStepVisual's sequence: the link types out one character at a
// time, it is copied, then the 30-day window shows. On scroll it follows the
// reader; when the stepper swipes it plays each time the step becomes
// active; reduced motion shows the card done.
const LINK_DELAY_MS = 300;
const LINK_DURATION_MS = 1100;
const COPY_DELAY_MS = LINK_DELAY_MS + LINK_DURATION_MS + 300;
const WINDOW_DELAY_MS = COPY_DELAY_MS + 400;
const TIMELINE_MS = WINDOW_DELAY_MS + 400;

const LinkBox = styled.div`
  align-items: center;
  background: ${shell.cardBackground};
  border: 1px dashed ${shell.borderStrong};
  border-radius: 4px;
  color: ${shell.text};
  display: flex;
  font-family: ui-monospace, monospace;
  font-size: 15px;
  justify-content: space-between;
  padding: 16px;
`;

// Monospace, so each step of the reveal uncovers exactly one character.
const LinkText = styled.span`
  --d: ${LINK_DELAY_MS}ms;

  [data-active] & {
    animation: creatorLinkType ${LINK_DURATION_MS}ms
      steps(${CREATOR_LINK.length}, end) both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorLinkType {
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

  & > span {
    grid-area: 1 / 1;
    text-align: right;
  }
`;

const CopyLabel = styled.span`
  color: ${shell.textSecondary};

  [data-active] & {
    animation: creatorLinkHide ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorLinkHide {
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
    animation: creatorLinkShow ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorLinkShow {
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Row = styled.div`
  align-items: center;
  border-top: 1px solid ${shell.borderLight};
  display: flex;
  justify-content: space-between;
  padding-top: 16px;

  --d: ${WINDOW_DELAY_MS}ms;

  [data-active] & {
    animation: creatorLinkRow ${DURATION.lg} ${EASING.standard} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorLinkRow {
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

export function CreatorLinkStepVisual({
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
        <CardHeader>{i18n._(msg`Your creator link`)}</CardHeader>
        <CardBody>
          <LinkBox>
            <LinkText>{CREATOR_LINK}</LinkText>
            <CopyAction>
              <CopyLabel>{i18n._(msg`Copy`)}</CopyLabel>
              <CopiedLabel>{i18n._(msg`Copied`)}</CopiedLabel>
            </CopyAction>
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
