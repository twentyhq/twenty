import { RecordShareAccessLevel } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { withNewWorkflowShareWith } from 'src/modules/workflow/common/utils/with-new-workflow-share-with.util';

type WorkflowCreatePayload = {
  data: { name: string };
  shareWith?: ShareWithInput[];
};

describe('withNewWorkflowShareWith', () => {
  const userAuthContext = {
    type: 'user',
    user: { id: 'user-id' },
    workspaceMemberId: 'workspace-member-id',
  } as unknown as WorkspaceAuthContext;
  const apiKeyAuthContext = {
    type: 'apiKey',
    apiKey: { id: 'api-key-id' },
  } as unknown as WorkspaceAuthContext;

  it('shares a workflow created by an API key with everyone', () => {
    expect(
      withNewWorkflowShareWith<WorkflowCreatePayload>({
        authContext: apiKeyAuthContext,
        payload: { data: { name: 'Workflow' } },
      }).shareWith,
    ).toEqual([{ everyone: true, accessLevel: RecordShareAccessLevel.FULL }]);
  });

  it('keeps the grants a caller named', () => {
    const shareWith = [
      { roleId: 'role-id', accessLevel: RecordShareAccessLevel.READ },
    ];

    expect(
      withNewWorkflowShareWith<WorkflowCreatePayload>({
        authContext: apiKeyAuthContext,
        payload: { data: { name: 'Workflow' }, shareWith },
      }).shareWith,
    ).toBe(shareWith);
  });

  // A person gets a creator grant, and the core mirror then grants everyone.
  it('leaves a workflow created by a person as it is', () => {
    expect(
      withNewWorkflowShareWith<WorkflowCreatePayload>({
        authContext: userAuthContext,
        payload: { data: { name: 'Workflow' } },
      }).shareWith,
    ).toBeUndefined();
  });
});
