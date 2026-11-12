import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isRootVisibleToCallerInOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/is-root-visible-to-caller-in-ownership-index.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';

const metadataOwnershipIndex: MetadataOwnershipIndex = {
  ownerUserWorkspaceIdByPrivateRootId: {
    'private-id': OWNER_USER_WORKSPACE_ID,
    'ownerless-id': null,
  },
  privateRootIdsByOwnerUserWorkspaceId: {},
  ownerUserWorkspaceIdByPrivateChildId: {},
};

describe('isRootVisibleToCallerInOwnershipIndex', () => {
  it('shows an id absent from the index to every caller', () => {
    expect(
      isRootVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        rootId: 'workspace-id',
        caller: {},
      }),
    ).toBe(true);
  });

  it('shows a private id to its owner only', () => {
    expect(
      isRootVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        rootId: 'private-id',
        caller: { userWorkspaceId: OWNER_USER_WORKSPACE_ID },
      }),
    ).toBe(true);
    expect(
      isRootVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        rootId: 'private-id',
        caller: { userWorkspaceId: OTHER_USER_WORKSPACE_ID },
      }),
    ).toBe(false);
    expect(
      isRootVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        rootId: 'private-id',
        caller: {},
      }),
    ).toBe(false);
  });

  it('hides a private id with no owner from every caller', () => {
    expect(
      isRootVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        rootId: 'ownerless-id',
        caller: { userWorkspaceId: OWNER_USER_WORKSPACE_ID },
      }),
    ).toBe(false);
  });
});
