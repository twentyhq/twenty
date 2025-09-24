import type { ToolCallEvent } from './ToolCallEvent';
import type { ToolResultEvent } from './ToolResultEvent';

export type ToolEvent = ToolCallEvent | ToolResultEvent;
