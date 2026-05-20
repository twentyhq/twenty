import type { AssistantResponseStreamingStage } from './assistant-response-stage';

export const ASSISTANT_RESPONSE_STREAMING_STAGES = [
  'rocket',
  'launch',
  'payload',
  'customer',
  'launchSite',
  'actions',
  'wrapup',
] as const satisfies readonly AssistantResponseStreamingStage[];
