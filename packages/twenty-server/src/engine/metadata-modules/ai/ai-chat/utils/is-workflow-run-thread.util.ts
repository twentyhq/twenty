import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type WorkflowRunThreadFields = {
  workflowRunId: string;
};

export const isWorkflowRunThread = <
  TThread extends Pick<AgentChatThreadWorkspaceEntity, 'workflowRunId'>,
>(
  thread: TThread,
): thread is TThread & WorkflowRunThreadFields =>
  isDefined(thread.workflowRunId);
