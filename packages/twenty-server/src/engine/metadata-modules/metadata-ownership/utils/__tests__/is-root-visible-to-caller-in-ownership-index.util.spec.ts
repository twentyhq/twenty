import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isRootVisibleToCallerInOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/is-root-visible-to-caller-in-ownership-index.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';

const OWNER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: OWNER_USER_WORKSPACE_ID,
};
const OTHER_MEMBER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: 'other-user-workspace-id',
};
const WITHOUT_WORKSPACE_MEMBER: MetadataCaller = {
  type: 'withoutWorkspaceMember',
};
const BYPASSING_PRIVACY: MetadataCaller = { type: 'bypassesPrivacy' };

const metadataOwnershipIndex: MetadataOwnershipIndex = {
  ownerUserWorkspaceIdByPrivateRootId: {
    'private-root': OWNER_USER_WORKSPACE_ID,
    'ownerless-root': null,
  },
  privateRootIdsByOwnerUserWorkspaceId: {},
  ownerUserWorkspaceIdByPrivateChildId: {},
};

describe('isRootVisibleToCallerInOwnershipIndex', () => {
  it('shows a root absent from the index to every caller', () => {
    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER].map((caller) =>
        isRootVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          rootId: 'workspace-root',
          caller,
        }),
      ),
    ).toEqual([true, true, true]);
  });

  it('shows a private root to its owner only', () => {
    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER].map((caller) =>
        isRootVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          rootId: 'private-root',
          caller,
        }),
      ),
    ).toEqual([true, false, false]);
  });

  it('hides a private root with no owner from every caller but a bypassing one', () => {
    expect(
      [OWNER, WITHOUT_WORKSPACE_MEMBER, BYPASSING_PRIVACY].map((caller) =>
        isRootVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          rootId: 'ownerless-root',
          caller,
        }),
      ),
    ).toEqual([false, false, true]);
  });
});
