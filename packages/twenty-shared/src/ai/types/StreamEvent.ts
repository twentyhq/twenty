import type { ErrorEvent } from './ErrorEvent';
import type { ReasoningDeltaEvent } from './ReasoningDeltaEvent';
import type { TextDeltaEvent } from './TextDeltaEvent';
import type { ToolCallEvent } from './ToolCallEvent';
import type { ToolResultEvent } from './ToolResultEvent';

export type StreamEvent =
  | ToolCallEvent
  | ToolResultEvent
  | {
      type: 'reasoning-start';
    }
  | ReasoningDeltaEvent
  | {
      type: 'reasoning-end';
    }
  | TextDeltaEvent
  | {
      type: 'step-finish';
    }
  | ErrorEvent;
