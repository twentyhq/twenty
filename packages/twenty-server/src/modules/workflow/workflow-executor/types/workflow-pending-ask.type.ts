import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';

// What a step that waits on a person is waiting for. The run opens it as an
// Ask when it parks the step, under the same lock as that transition.
export type WorkflowPendingAsk = Pick<InputAskWorkspaceEntity, 'name'> & {
  form: NonNullable<InputAskWorkspaceEntity['form']>;
  threadId?: string;
  toolCallId?: string;
};
