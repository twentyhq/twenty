// The assistant's authored beat sheet: thinking, then one streamed
// paragraph per created object, then actions/wrapup copy, then the
// changes card. Pure data + lookups (jest-covered).
export type AssistantResponseStage =
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

export type AssistantResponseStreamingStage = Exclude<
  AssistantResponseStage,
  'thinking' | 'card' | 'done'
>;

const STAGE_DELAYS = {
  afterCardRevealMs: 180,
  afterObjectBeatMs: 520,
  beforeCardMs: 420,
  betweenParagraphsMs: 320,
};

const STAGE_ORDER: readonly AssistantResponseStage[] = [
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

const STREAMING_STAGES: readonly AssistantResponseStreamingStage[] = [
  'rocket',
  'launch',
  'payload',
  'customer',
  'launchSite',
  'actions',
  'wrapup',
];

type StageTransition = {
  nextStage: AssistantResponseStage;
  delayMs: number;
};

const STAGE_TRANSITIONS: Record<
  AssistantResponseStreamingStage,
  StageTransition
> = {
  actions: {
    delayMs: STAGE_DELAYS.betweenParagraphsMs,
    nextStage: 'wrapup',
  },
  customer: {
    delayMs: STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'launchSite',
  },
  launch: {
    delayMs: STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'payload',
  },
  launchSite: {
    delayMs: STAGE_DELAYS.betweenParagraphsMs,
    nextStage: 'actions',
  },
  payload: {
    delayMs: STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'customer',
  },
  rocket: {
    delayMs: STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'launch',
  },
  wrapup: {
    delayMs: STAGE_DELAYS.beforeCardMs,
    nextStage: 'card',
  },
};

function isStreamingStage(
  stage: AssistantResponseStage,
): stage is AssistantResponseStreamingStage {
  return (STREAMING_STAGES as readonly string[]).includes(stage);
}

export const assistantResponseStage = {
  delays: STAGE_DELAYS,
  order: STAGE_ORDER,
  streamingStages: STREAMING_STAGES,
  getTransition: (stage: AssistantResponseStage): StageTransition | null =>
    isStreamingStage(stage) ? STAGE_TRANSITIONS[stage] : null,
  hasReached: ({
    currentStage,
    targetStage,
  }: {
    currentStage: AssistantResponseStage;
    targetStage: AssistantResponseStage;
  }): boolean =>
    STAGE_ORDER.indexOf(currentStage) >= STAGE_ORDER.indexOf(targetStage),
};
