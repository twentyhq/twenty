import { FieldActorSource } from 'twenty-shared/types';

import { buildWorkflowRunTriggerContext } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-trigger-context.util';

const WORKSPACE_MEMBER = {
  id: 'member-id',
  name: { firstName: 'Jane', lastName: 'Austen' },
};

describe('buildWorkflowRunTriggerContext', () => {
  it('records a member who starts a run directly', () => {
    expect(
      buildWorkflowRunTriggerContext({ workspaceMember: WORKSPACE_MEMBER })
        .createdBy,
    ).toEqual({
      source: FieldActorSource.MANUAL,
      workspaceMemberId: 'member-id',
      name: 'Jane Austen',
      context: {},
    });
  });
});
