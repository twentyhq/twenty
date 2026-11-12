import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { buildWorkflowActorMetadata } from 'src/modules/workflow/workflow-executor/utils/build-workflow-actor-metadata.util';

const MEMBER_INITIATOR: ActorMetadata = {
  source: FieldActorSource.MANUAL,
  workspaceMemberId: 'member-id',
  name: 'Tim Apple',
  context: { applicationId: 'application-id' },
};

const buildExecutionContext = (
  overrides: Partial<WorkflowExecutionContext> = {},
): WorkflowExecutionContext =>
  ({
    isActingOnBehalfOfUser: false,
    initiator: MEMBER_INITIATOR,
    workflowId: 'workflow-id',
    workflowName: 'Churn win-back',
    ...overrides,
  }) as WorkflowExecutionContext;

describe('buildWorkflowActorMetadata', () => {
  it('attributes an automated run to the workflow by name and id', () => {
    expect(buildWorkflowActorMetadata(buildExecutionContext())).toEqual({
      source: FieldActorSource.WORKFLOW,
      name: 'Churn win-back',
      workspaceMemberId: null,
      context: { workflowId: 'workflow-id' },
    });
  });

  it('falls back to a generic name when the workflow is unnamed', () => {
    expect(
      buildWorkflowActorMetadata(buildExecutionContext({ workflowName: '  ' }))
        .name,
    ).toBe('Workflow');
  });

  it('keeps the member as the actor of a run they launched, and records the workflow', () => {
    expect(
      buildWorkflowActorMetadata(
        buildExecutionContext({ isActingOnBehalfOfUser: true }),
      ),
    ).toEqual({
      ...MEMBER_INITIATOR,
      context: { applicationId: 'application-id', workflowId: 'workflow-id' },
    });
  });
});
