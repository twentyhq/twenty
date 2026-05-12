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

type AssistantResponseStageTransition = {
  nextStage: AssistantResponseStage;
  delayMs: number;
};

export const ASSISTANT_RESPONSE_STAGE_DELAYS = {
  afterCardRevealMs: 180,
  afterObjectBeatMs: 520,
  beforeCardMs: 420,
  betweenParagraphsMs: 320,
} as const;

export const ASSISTANT_RESPONSE_STAGE_ORDER: readonly AssistantResponseStage[] =
  [
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

const ASSISTANT_RESPONSE_STAGE_TRANSITIONS: Record<
  AssistantResponseStreamingStage,
  AssistantResponseStageTransition
> = {
  actions: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.betweenParagraphsMs,
    nextStage: 'wrapup',
  },
  customer: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'launchSite',
  },
  launch: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'payload',
  },
  launchSite: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.betweenParagraphsMs,
    nextStage: 'actions',
  },
  payload: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'customer',
  },
  rocket: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.afterObjectBeatMs,
    nextStage: 'launch',
  },
  wrapup: {
    delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.beforeCardMs,
    nextStage: 'card',
  },
};

export const hasAssistantResponseStageReached = ({
  currentStage,
  targetStage,
}: {
  currentStage: AssistantResponseStage;
  targetStage: AssistantResponseStage;
}) =>
  ASSISTANT_RESPONSE_STAGE_ORDER.indexOf(currentStage) >=
  ASSISTANT_RESPONSE_STAGE_ORDER.indexOf(targetStage);

export const getAssistantResponseStageTransition = (
  completedStage: AssistantResponseStage,
): AssistantResponseStageTransition | null =>
  completedStage in ASSISTANT_RESPONSE_STAGE_TRANSITIONS
    ? ASSISTANT_RESPONSE_STAGE_TRANSITIONS[
        completedStage as AssistantResponseStreamingStage
      ]
    : null;
