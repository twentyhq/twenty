import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { isVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-visible-to-caller.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';

describe('isVisibleToCaller', () => {
  it('shows a workspace row to every caller, including one without a user', () => {
    const row = {
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    };

    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row,
        caller: { userWorkspaceId: OTHER_USER_WORKSPACE_ID },
      }),
    ).toBe(true);
    expect(
      isVisibleToCaller({ rootMetadataName: 'view', row, caller: {} }),
    ).toBe(true);
  });

  it('shows a workspace row that has no owner', () => {
    expect(
      isVisibleToCaller({
        rootMetadataName: 'workflow',
        row: {
          visibility: WorkflowVisibility.WORKSPACE,
          createdByUserWorkspaceId: null,
        },
        caller: {},
      }),
    ).toBe(true);
  });

  it('shows a private row to its owner only', () => {
    const row = {
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    };

    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row,
        caller: { userWorkspaceId: OWNER_USER_WORKSPACE_ID },
      }),
    ).toBe(true);
    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row,
        caller: { userWorkspaceId: OTHER_USER_WORKSPACE_ID },
      }),
    ).toBe(false);
  });

  it('hides a private row from a caller without a user', () => {
    expect(
      isVisibleToCaller({
        rootMetadataName: 'workflow',
        row: {
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
        caller: {},
      }),
    ).toBe(false);
  });

  it('hides a private row with no owner from every caller', () => {
    const row = {
      visibility: WorkflowVisibility.PRIVATE,
      createdByUserWorkspaceId: null,
    };

    expect(
      isVisibleToCaller({
        rootMetadataName: 'workflow',
        row,
        caller: { userWorkspaceId: OWNER_USER_WORKSPACE_ID },
      }),
    ).toBe(false);
    expect(
      isVisibleToCaller({ rootMetadataName: 'workflow', row, caller: {} }),
    ).toBe(false);
  });
});
