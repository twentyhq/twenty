import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { buildWorkflowActorMetadata } from 'src/modules/workflow/workflow-executor/utils/build-workflow-actor-metadata.util';

const MEMBER_INITIATOR: ActorMetadata = {
  source: FieldActorSource.MANUAL,
  workspaceMemberId: 'member-id',
  name: 'Tim Apple',
  context: { applicationId: 'application-id' },
};

type WorkflowActorInput = Parameters<typeof buildWorkflowActorMetadata>[0];

const buildExecutionContext = (
  overrides: Partial<WorkflowActorInput> = {},
): WorkflowActorInput => ({
  isActingOnBehalfOfUser: false,
  initiator: MEMBER_INITIATOR,
  coreWorkflowId: 'workflow-id',
  workflowName: 'Churn win-back',
  ...overrides,
});

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
