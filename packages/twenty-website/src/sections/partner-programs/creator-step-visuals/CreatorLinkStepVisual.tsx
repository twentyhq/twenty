'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconCheck, IconClock, IconLink, IconShare } from '@tabler/icons-react';

import { color, DURATION, EASING, fontFamily, REDUCED_MOTION } from '@/tokens';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const {
  Panel,
  PanelHeader,
  Row,
  RowLabel,
  RowValue,
  Stage,
  scrub,
  timelineDelay,
} = STEP_CARD_CHROME;

// Fictional link: the real format comes from the program, not this page.
const CREATOR_LINK = 'twenty.com/?via=yourname';

// PartnerCodeStepVisual's sequence: the link types out one character at a
// time, it is copied, then the 30-day window shows. On scroll it follows the
// reader; when the stepper swipes it plays each time the step becomes
// active; reduced motion shows the panel done.
const LINK_DELAY_MS = 300;
const LINK_DURATION_MS = 1100;
const COPY_DELAY_MS = LINK_DELAY_MS + LINK_DURATION_MS + 300;
const WINDOW_DELAY_MS = COPY_DELAY_MS + 400;
const TIMELINE_MS = WINDOW_DELAY_MS + 400;

// Icon, value, then an action or a figure at the end of the row.
const TrailingRow = styled(Row)`
  grid-template-columns: auto minmax(0, 1fr) auto;
`;

// Monospace, so each step of the reveal uncovers exactly one character.
const LinkText = styled.span`
  color: ${color('white')};
  font-family: ${fontFamily('mono')};
  font-size: 15px;
  overflow: hidden;
  white-space: nowrap;

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

// Both share one cell; Copy gives way to a check once the link is copied.
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
    opacity: 0;
  }
`;

const CopiedCheck = styled.span`
  color: ${color('green')};
  display: inline-flex;
  opacity: 0;
  transform: scale(0.85);

  [data-active] & {
    animation: creatorLinkShow ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorLinkShow {
    to {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
`;

const WindowRow = styled(TrailingRow)`
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
      <Panel>
        <PanelHeader>
          <IconShare size={20} stroke={1.5} />
          {i18n._(msg`Your creator link`)}
        </PanelHeader>
        <TrailingRow>
          <IconLink color={color('green')} size={20} stroke={1.5} />
          <LinkText>{CREATOR_LINK}</LinkText>
          <CopyAction>
            <CopyLabel>{i18n._(msg`Copy`)}</CopyLabel>
            <CopiedCheck>
              <IconCheck size={20} stroke={2} />
            </CopiedCheck>
          </CopyAction>
        </TrailingRow>
        <WindowRow>
          <IconClock color={color('pink')} size={20} stroke={1.5} />
          <RowLabel>{i18n._(msg`Signups credited after a click`)}</RowLabel>
          <RowValue>{i18n._(msg`30 days`)}</RowValue>
        </WindowRow>
      </Panel>
    </Stage>
  );
}
