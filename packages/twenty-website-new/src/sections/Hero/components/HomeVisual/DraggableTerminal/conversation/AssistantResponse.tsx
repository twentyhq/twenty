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
import { StreamingText, type StreamingSegment } from './StreamingText';
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

const CardWrap = styled.div<{ $instant: boolean }>`
  animation: ${({ $instant }) =>
    $instant
      ? 'none'
      : 'chatCardRise 420ms cubic-bezier(0.22, 1, 0.36, 1) both'};

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

const text = (value: string, onReveal?: () => void): StreamingSegment => ({
  kind: 'text',
  value,
  onReveal,
});
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
  text(
    ' object that ships with Twenty, so accounts, domain favicons, and the People relation work for free. ',
  ),
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

const PINNED_ACTIONS_PARAGRAPH: StreamingSegment[] = [
  text(
    'Each object also gets 2-3 relevant quick commands pinned to its header, to the left of ',
  ),
  node('pa-new', <InlineCode>New</InlineCode>),
  text(' — '),
  node('pa-rocket', <InlineCode>Rocket</InlineCode>),
  text(' has reuse / retire shortcuts, '),
  node('pa-launch', <InlineCode>Launch</InlineCode>),
  text(' has '),
  node('pa-l-resched', <InlineCode>Reschedule</InlineCode>),
  text(' and '),
  node('pa-l-payload', <InlineCode>Add payload</InlineCode>),
  text(', '),
  node('pa-payload', <InlineCode>Payload</InlineCode>),
  text(' has '),
  node('pa-p-book', <InlineCode>Book slot</InlineCode>),
  text(', '),
  node('pa-companies', <InlineCode>Companies</InlineCode>),
  text(' has a quick '),
  node('pa-c-status', <InlineCode>Set status</InlineCode>),
  text(', and '),
  node('pa-site', <InlineCode>Launch site</InlineCode>),
  text(' has '),
  node('pa-s-window', <InlineCode>Book window</InlineCode>),
  text('. Defined under '),
  node('pa-folder', <FileLink>src/command-menu-items/</FileLink>),
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
  node(
    'w-vitest',
    <InlineCode>vitest run schema.integration-test.ts</InlineCode>,
  ),
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
  | 'actions'
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
  'actions',
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
  instantComplete?: boolean;
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
};

export const AssistantResponse = ({
  instantComplete = false,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: AssistantResponseProps) => {
  const [stage, setStage] = useState<Stage>(
    instantComplete ? 'done' : 'thinking',
  );
  const hasNotifiedChatFinishedRef = useRef(false);
  const advanceTimeoutsRef = useRef<Set<number>>(new Set());
  const objectCreationHandler = instantComplete ? undefined : onObjectCreated;

  useEffect(() => {
    const timeouts = advanceTimeoutsRef.current;
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      timeouts.clear();
    };
  }, []);

  // Segments are rebuilt whenever the caller's onObjectCreated identity
  // changes so each object chip's onReveal is wired to the latest handler.
  // HomeVisual memoizes the handler with useCallback, so segments stay stable
  // during streaming and StreamingText doesn't reset mid-reveal.
  const rocketParagraph = useMemo(
    () => buildIntroAndRocketParagraph(objectCreationHandler),
    [objectCreationHandler],
  );
  const launchParagraph = useMemo(
    () => buildLaunchParagraph(objectCreationHandler),
    [objectCreationHandler],
  );
  const payloadParagraph = useMemo(
    () => buildPayloadParagraph(objectCreationHandler),
    [objectCreationHandler],
  );
  const customerParagraph = useMemo(
    () => buildCustomerParagraph(objectCreationHandler),
    [objectCreationHandler],
  );
  const launchSiteParagraph = useMemo(
    () => buildLaunchSiteParagraph(objectCreationHandler),
    [objectCreationHandler],
  );

  useEffect(() => {
    if (instantComplete) {
      return undefined;
    }
    const id = window.setTimeout(
      () => setStage('rocket'),
      CHAT_TIMINGS.thinkingMs,
    );
    return () => window.clearTimeout(id);
  }, [instantComplete]);

  useEffect(() => {
    if (!instantComplete) {
      return;
    }
    setStage('done');
  }, [instantComplete]);

  useEffect(() => {
    if (
      (stage !== 'card' && stage !== 'done') ||
      hasNotifiedChatFinishedRef.current
    ) {
      return undefined;
    }
    hasNotifiedChatFinishedRef.current = true;
    const id = window.setTimeout(
      () => {
        onChatFinished?.();
      },
      stage === 'done' ? 0 : AFTER_CARD_REVEAL_MS,
    );
    return () => window.clearTimeout(id);
  }, [stage, onChatFinished]);

  const advanceTo = useCallback(
    (next: Stage, delayMs: number) => () => {
      const id = window.setTimeout(() => {
        advanceTimeoutsRef.current.delete(id);
        setStage(next);
      }, delayMs);
      advanceTimeoutsRef.current.add(id);
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
            instant={instantComplete}
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
            instant={instantComplete}
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
            instant={instantComplete}
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
            instant={instantComplete}
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
            instant={instantComplete}
            onComplete={
              stage === 'launchSite'
                ? advanceTo('actions', BETWEEN_PARAGRAPHS_MS)
                : undefined
            }
            segments={launchSiteParagraph}
          />
        </Paragraph>
      )}

      {has('actions') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            instant={instantComplete}
            onComplete={
              stage === 'actions'
                ? advanceTo('wrapup', BETWEEN_PARAGRAPHS_MS)
                : undefined
            }
            segments={PINNED_ACTIONS_PARAGRAPH}
          />
        </Paragraph>
      )}

      {has('wrapup') && (
        <Paragraph>
          <StreamingText
            charDurationMs={CHAT_TIMINGS.textStreamCharMs}
            instant={instantComplete}
            onComplete={
              stage === 'wrapup' ? advanceTo('card', BEFORE_CARD_MS) : undefined
            }
            segments={WRAPUP_PARAGRAPH}
          />
        </Paragraph>
      )}

      {has('card') && (
        <CardWrap $instant={instantComplete}>
          <ChangesSummaryCard onUndo={onUndo} />
        </CardWrap>
      )}
    </ResponseRoot>
  );
};
