'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconCheck, IconKey } from '@tabler/icons-react';

import { color, DURATION, EASING, fontFamily, REDUCED_MOTION } from '@/tokens';

import { STEP_CARD_CHROME } from './step-card-chrome';

const { Panel, PanelHeader, Row, RowLabel, Stage, scrub, timelineDelay } =
  STEP_CARD_CHROME;

const PARTNER_CODE = 'TWENTY-7F3K';

// The approval lands, the code types out one character at a time, then it
// is copied. On scroll it follows the reader; when the stepper swipes it
// plays each time the step becomes active; reduced motion shows the panel
// done.
const CODE_DELAY_MS = 400;
const CODE_DURATION_MS = 900;
const COPY_DELAY_MS = CODE_DELAY_MS + CODE_DURATION_MS + 400;
const TIMELINE_MS = COPY_DELAY_MS + 300;

const StatusDot = styled.span`
  background: ${color('green')};
  border-radius: 50%;
  height: 8px;
  width: 8px;

  [data-active] & {
    animation: codePulse 1.6s ${EASING.gentle} 2;
  }

  @keyframes codePulse {
    0% {
      box-shadow: 0 0 0 0 ${color('green')};
    }
    100% {
      box-shadow: 0 0 0 8px transparent;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Status = styled(RowLabel)`
  color: ${color('green')};
  margin-left: auto;
`;

// Icon, the code under its label, then Copy.
const CodeRow = styled(Row)`
  grid-template-columns: auto minmax(0, 1fr) auto;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

// Monospace, so each step of the reveal uncovers exactly one character.
const CodeText = styled.span`
  color: ${color('white')};
  font-family: ${fontFamily('mono')};
  font-size: 22px;
  letter-spacing: 0.08em;

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

// Both share one cell; Copy gives way to a check once the code is copied.
const CopyAction = styled.span`
  --d: ${COPY_DELAY_MS}ms;
  display: grid;

  justify-items: end;

  & > span {
    align-self: center;
    grid-area: 1 / 1;
    text-align: right;
  }
`;

const CopyLabel = styled(RowLabel)`
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
    opacity: 0;
  }
`;

const CopiedCheck = styled.span`
  color: ${color('green')};
  display: inline-flex;
  opacity: 0;
  transform: scale(0.85);

  [data-active] & {
    animation: codeShow ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes codeShow {
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* Reduced motion shows the panel done: the check, not Copy. */
  ${REDUCED_MOTION} {
    animation: none !important;
    opacity: 1;
    transform: none;
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
      <Panel>
        <PanelHeader>
          <StatusDot />
          {i18n._(msg`Application approved`)}
          <Status>{i18n._(msg`Partner`)}</Status>
        </PanelHeader>
        <CodeRow>
          <IconKey color={color('green')} size={20} stroke={1.5} />
          <Field>
            <RowLabel>{i18n._(msg`Your partner code`)}</RowLabel>
            <CodeText>{PARTNER_CODE}</CodeText>
          </Field>
          <CopyAction>
            <CopyLabel>{i18n._(msg`Copy`)}</CopyLabel>
            <CopiedCheck>
              <IconCheck size={20} stroke={2} />
            </CopiedCheck>
          </CopyAction>
        </CodeRow>
      </Panel>
    </Stage>
  );
}
