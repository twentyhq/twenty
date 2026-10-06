import { type ToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/types/tool-call-workflow-step.type';

export type AwaitedToolCallWaiter =
  | {
      status: 'ready';
      resume: (toolResult: Record<string, unknown>) => Promise<void>;
    }
  | { status: 'not_ready' }
  | { status: 'gone' };

export type AwaitedToolCallHandler = {
  findWaiter: (args: {
    workspaceId: string;
    threadId: string;
    workflowStep: ToolCallWorkflowStep;
  }) => Promise<AwaitedToolCallWaiter>;
  failWaiter: (args: {
    workspaceId: string;
    workflowStep: ToolCallWorkflowStep;
  }) => Promise<void>;
};
