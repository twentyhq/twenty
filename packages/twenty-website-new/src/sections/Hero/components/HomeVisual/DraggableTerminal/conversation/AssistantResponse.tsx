'use client';

import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { TERMINAL_TOKENS } from '../terminalTokens';
import { CHAT_TIMINGS } from './animationTiming';
import { ChangesSummaryCard } from './ChangesSummaryCard';
import {
  StreamingText,
  type StreamingSegment,
} from './StreamingText';
import { ThinkingIndicator } from './ThinkingIndicator';

// Delay between one paragraph finishing its stream and the next starting —
// gives the reader a beat before new text appears.
const BETWEEN_PARAGRAPHS_MS = 320;
// Extra breath after each object paragraph, so the sidebar pop-in has a
// moment to settle before the next object's paragraph begins streaming.
const AFTER_OBJECT_BEAT_MS = 520;
// Delay before the diff card slides in after the prose is done.
const BEFORE_CARD_MS = 420;
// Delay after the card lands before we signal the chat is finished.
const AFTER_CARD_REVEAL_MS = 180;

const ResponseRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const Paragraph = styled.p`
  color: ${TERMINAL_TOKENS.text.prompt};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
`;

const InlineCode = styled.span`
  background: rgba(0, 0, 0, 0.045);
  border-radius: 3px;
  color: rgba(0, 0, 0, 0.78);
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  padding: 1px 5px;
`;

const FileLink = styled.span`
  color: #2a66de;
  cursor: pointer;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const ReferenceLink = styled.a`
  color: #2a66de;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #1e4ea8;
  }
`;

const CardWrap = styled.div`
  animation: chatCardRise 420ms cubic-bezier(0.22, 1, 0.36, 1) both;

  @keyframes chatCardRise {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// -- Paragraph segment builders --

const text = (
  value: string,
  onReveal?: () => void,
): StreamingSegment => ({ kind: 'text', value, onReveal });
const node = (
  key: string,
  value: ReactNode,
  onReveal?: () => void,
): StreamingSegment => ({
  kind: 'node',
  value: <span key={key}>{value}</span>,
  onReveal,
});

// Sidebar ids mirror the ones in rocketObject.ts; keep in sync.
const ROCKET_ID = 'rockets';
const LAUNCH_ID = 'launches';
const PAYLOAD_ID = 'payloads';
// Customers re-use the standard Companies object — the chat highlights the
// existing Companies sidebar item instead of creating a new Customer object.
const COMPANIES_ID = 'companies';
const LAUNCH_SITE_ID = 'launch-sites';

const buildIntroAndRocketParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text(
    "I'll scaffold a launch-ops CRM in your workspace — four new objects plus the standard ",
  ),
  node('rocket-companies', <InlineCode>Companies</InlineCode>),
  text(' object for customers, with shared UUIDs in '),
  node('rocket-ids', <FileLink>schema-identifiers.ts</FileLink>),
  text('. First up: '),
  node(
    'rocket-chip',
    <InlineCode>Rocket</InlineCode>,
    onObjectCreated ? () => onObjectCreated(ROCKET_ID) : undefined,
  ),
  text(
    ' — each vehicle gets a serial number, manufacturer, lifecycle status, reusability, launch date, dimensions, and target orbit in ',
  ),
  node('rocket-file', <FileLink>rocket.object.ts</FileLink>),
  text('.'),
];

const buildLaunchParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Next up: '),
  node(
    'launch-chip',
    <InlineCode>Launch</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_ID) : undefined,
  ),
  text(
    ' — every mission gets a unique mission code, status, mission type, planned and actual launch times, and a summary. Defined in ',
  ),
  node('launch-file', <FileLink>launch.object.ts</FileLink>),
  text('.'),
];

const buildPayloadParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Now '),
  node(
    'payload-chip',
    <InlineCode>Payload</InlineCode>,
    onObjectCreated ? () => onObjectCreated(PAYLOAD_ID) : undefined,
  ),
  text(
    ' — what actually flies: satellites, crew capsules, cargo, probes, landers — with type, status, target orbit, mass, and a customer reference. Scoped in ',
  ),
  node('payload-file', <FileLink>payload.object.ts</FileLink>),
  text('.'),
];

const buildCustomerParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('For customers, no new object — I reuse the standard '),
  node(
    'customer-chip',
    <InlineCode>Companies</InlineCode>,
    onObjectCreated ? () => onObjectCreated(COMPANIES_ID) : undefined,
  ),
  text(' object that ships with Twenty, so accounts, domain favicons, and the People relation work for free. '),
  node('customer-file', <FileLink>payload.object.ts</FileLink>),
  text(' points its '),
  node('customer-field', <InlineCode>customer</InlineCode>),
  text(' relation straight at it.'),
];

const buildLaunchSiteParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Last object: '),
  node(
    'launch-site-chip',
    <InlineCode>Launch site</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_SITE_ID) : undefined,
  ),
  text(
    ' — pads and ranges with a site code, country, region, pad name, and operational status. Lives in ',
  ),
  node('launch-site-file', <FileLink>launch-site.object.ts</FileLink>),
  text('.'),
];

const WRAPUP_PARAGRAPH: StreamingSegment[] = [
  text('Relations wire '),
  node('w-rl', <InlineCode>Rocket → Launches</InlineCode>),
  text(', '),
  node('w-sl', <InlineCode>LaunchSite → Launches</InlineCode>),
  text(', '),
  node('w-cp', <InlineCode>Company → Payloads</InlineCode>),
  text(', and '),
  node('w-lp', <InlineCode>Launch → Payloads</InlineCode>),
  text('. Each object gets an index view and sidebar entry; '),
  node('w-launches', <InlineCode>Launches</InlineCode>),
  text(' also has '),
  node('w-upcoming', <FileLink>upcoming-launches.view.ts</FileLink>),
  text(' and '),
  node('w-past', <FileLink>past-launches.view.ts</FileLink>),
  text('. Verified with '),
  node('w-lint', <InlineCode>yarn lint</InlineCode>),
  text(', '),
  node('w-tsc', <InlineCode>tsc --noEmit</InlineCode>),
  text(', '),
  node('w-vitest', <InlineCode>vitest run schema.integration-test.ts</InlineCode>),
  text(', and '),
  node('w-dev', <InlineCode>yarn twenty dev --once</InlineCode>),
  text('. Reference: '),
  node(
    'w-docs',
    <ReferenceLink
      href="https://twenty.com/developers"
      onClick={(event) => event.preventDefault()}
    >
      Twenty app-building docs
    </ReferenceLink>,
  ),
  text('.'),
];

type Stage =
  | 'thinking'
  | 'rocket'
  | 'launch'
  | 'payload'
  | 'customer'
  | 'launchSite'
  | 'wrapup'
  | 'card'
  | 'done';

const STAGE_ORDER: Stage[] = [
  'thinking',
  'rocket',
  'launch',
  'payload',
  'customer',
  'launchSite',
  'wrapup',
  'card',
  'done',
];

// Progressive renderer: advances to the next stage once the previous one
// signals completion (via StreamingText's `onComplete`). Every transition
// flows through setTimeout so it's trivial to retime via the constants at the
// top of the file. Each object sentence is its own stage so the sidebar pop-in
// has room to breathe before the next object is mentioned.
type AssistantResponseProps = {
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
};

export const AssistantResponse = ({
  onUndo,
  onObjectCreated,
  onChatFinished,
}: AssistantResponseProps) => {
  const [stage, setStage] = useState<Stage>('thinking');
  const hasNotifiedChatFinishedRef = useRef(false);

  // Segments are rebuilt whenever the caller's onObjectCreated identity
  // changes so each object chip's onReveal is wired to the latest handler.
  // HomeVisual memoizes the handler with useCallback, so segments stay stable
  // during streaming and StreamingText doesn't reset mid-reveal.
  const rocketParagraph = useMemo(
    () => buildIntroAndRocketParagraph(onObjectCreated),
    [onObjectCreated],
  );
  const launchParagraph = useMemo(
    () => buildLaunchParagraph(onObjectCreated),
    [onObjectCreated],
  );
  const payloadParagraph = useMemo(
    () => buildPayloadParagraph(onObjectCreated),
    [onObjectCreated],
  );
  const customerParagraph = useMemo(
    () => buildCustomerParagraph(onObjectCreated),
    [onObjectCreated],
  );
  const launchSiteParagraph = useMemo(
    () => buildLaunchSiteParagraph(onObjectCreated),
    [onObjectCreated],
  );

  useEffect(() => {
    const id = window.setTimeout(
      () => setStage('rocket'),
      CHAT_TIMINGS.thinkingMs,
    );
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (stage !== 'card' || hasNotifiedChatFinishedRef.current) {
      return undefined;
    }
    hasNotifiedChatFinishedRef.current = true;
    const id = window.setTimeout(() => {
      onChatFinished?.();
    }, AFTER_CARD_REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [stage, onChatFinished]);

  const advanceTo = useCallback(
    (next: Stage, delayMs: number) => () => {
      window.setTimeout(() => setStage(next), delayMs);
    },
    [],
  );

  const has = (target: Stage): boolean =>
    STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(target);

  return (
    <ResponseRoot>
      {stage === 'thinking' && <ThinkingIndicator />}

      {has('rocket') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'rocket'
                ? advanceTo('launch', AFTER_OBJECT_BEAT_MS)
                : undefined
            }
            segments={rocketParagraph}
          />
        </Paragraph>
      )}

      {has('launch') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'launch'
                ? advanceTo('payload', AFTER_OBJECT_BEAT_MS)
                : undefined
            }
            segments={launchParagraph}
          />
        </Paragraph>
      )}

      {has('payload') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'payload'
                ? advanceTo('customer', AFTER_OBJECT_BEAT_MS)
                : undefined
            }
            segments={payloadParagraph}
          />
        </Paragraph>
      )}

      {has('customer') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'customer'
                ? advanceTo('launchSite', AFTER_OBJECT_BEAT_MS)
                : undefined
            }
            segments={customerParagraph}
          />
        </Paragraph>
      )}

      {has('launchSite') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'launchSite'
                ? advanceTo('wrapup', BETWEEN_PARAGRAPHS_MS)
                : undefined
            }
            segments={launchSiteParagraph}
          />
        </Paragraph>
      )}

      {has('wrapup') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            onComplete={
              stage === 'wrapup'
                ? advanceTo('card', BEFORE_CARD_MS)
                : undefined
            }
            segments={WRAPUP_PARAGRAPH}
          />
        </Paragraph>
      )}

      {has('card') && (
        <CardWrap>
          <ChangesSummaryCard onUndo={onUndo} />
        </CardWrap>
      )}
    </ResponseRoot>
  );
};
