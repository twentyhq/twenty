import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { isVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-visible-to-caller.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';
const OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';

const OWNER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: OWNER_USER_WORKSPACE_ID,
};
const OTHER_MEMBER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
};
const WITHOUT_WORKSPACE_MEMBER: MetadataCaller = {
  type: 'withoutWorkspaceMember',
};
const BYPASSING_PRIVACY: MetadataCaller = { type: 'bypassesPrivacy' };

describe('isVisibleToCaller', () => {
  it('shows a workspace row to every caller', () => {
    const row = {
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    };

    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER, BYPASSING_PRIVACY].map(
        (caller) =>
          isVisibleToCaller({ rootMetadataName: 'view', row, caller }),
      ),
    ).toEqual([true, true, true, true]);
  });

  it('shows a private row to its owner only', () => {
    const row = {
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    };

    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER].map((caller) =>
        isVisibleToCaller({ rootMetadataName: 'view', row, caller }),
      ),
    ).toEqual([true, false, false]);
  });

  it('hides a private row with no owner from every caller but a bypassing one', () => {
    const row = {
      visibility: WorkflowVisibility.PRIVATE,
      createdByUserWorkspaceId: null,
    };

    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER, BYPASSING_PRIVACY].map(
        (caller) =>
          isVisibleToCaller({ rootMetadataName: 'workflow', row, caller }),
      ),
    ).toEqual([false, false, false, true]);
  });

  it('treats a row whose visibility is unreadable as private', () => {
    expect(
      isVisibleToCaller({
        rootMetadataName: 'workflow',
        row: { createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID },
        caller: OTHER_MEMBER,
      }),
    ).toBe(false);
  });

  it('reads the visibility a view override makes effective', () => {
    const privatelyOverriddenView = {
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
      overrides: {
        [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          visibility: ViewVisibility.UNLISTED,
        },
      },
    };

    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row: privatelyOverriddenView,
        caller: OWNER,
      }),
    ).toBe(true);
    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row: privatelyOverriddenView,
        caller: OTHER_MEMBER,
      }),
    ).toBe(false);
  });

  it('shows a view an override makes a workspace one to everyone', () => {
    expect(
      isVisibleToCaller({
        rootMetadataName: 'view',
        row: {
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              visibility: ViewVisibility.WORKSPACE,
            },
          },
        },
        caller: OTHER_MEMBER,
      }),
    ).toBe(true);
  });
});
