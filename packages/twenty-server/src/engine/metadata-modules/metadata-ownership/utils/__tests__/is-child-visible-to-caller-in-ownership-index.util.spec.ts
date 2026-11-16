import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isChildVisibleToCallerInOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/is-child-visible-to-caller-in-ownership-index.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';

const OWNER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: OWNER_USER_WORKSPACE_ID,
};
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';
const OTHER_MEMBER: MetadataCaller = {
  type: 'workspaceMember',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
};
const WITHOUT_WORKSPACE_MEMBER: MetadataCaller = {
  type: 'withoutWorkspaceMember',
};
const BYPASSING_PRIVACY: MetadataCaller = { type: 'bypassesPrivacy' };

const metadataOwnershipIndex: MetadataOwnershipIndex = {
  ownerUserWorkspaceIdByPrivateRootId: {},
  privateRootIdsByOwnerUserWorkspaceId: {},
  ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName: {
    viewField: {
      'private-child': OWNER_USER_WORKSPACE_ID,
      'rootless-child': null,
    },
    viewFilter: { 'private-child': OTHER_USER_WORKSPACE_ID },
  },
};

describe('isChildVisibleToCallerInOwnershipIndex', () => {
  it('answers per child type when two children share an id', () => {
    expect(
      isChildVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        childMetadataName: 'viewFilter',
        childId: 'private-child',
        caller: OWNER,
      }),
    ).toBe(false);
    expect(
      isChildVisibleToCallerInOwnershipIndex({
        metadataOwnershipIndex,
        childMetadataName: 'viewFilter',
        childId: 'private-child',
        caller: OTHER_MEMBER,
      }),
    ).toBe(true);
  });

  it('shows a child absent from the index to every caller', () => {
    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER].map((caller) =>
        isChildVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          childMetadataName: 'viewField',
          childId: 'workspace-child',
          caller,
        }),
      ),
    ).toEqual([true, true, true]);
  });

  it('shows a child of a private root to its owner only', () => {
    expect(
      [OWNER, OTHER_MEMBER, WITHOUT_WORKSPACE_MEMBER].map((caller) =>
        isChildVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          childMetadataName: 'viewField',
          childId: 'private-child',
          caller,
        }),
      ),
    ).toEqual([true, false, false]);
  });

  it('hides a child whose root is missing from every caller but a bypassing one', () => {
    expect(
      [OWNER, WITHOUT_WORKSPACE_MEMBER, BYPASSING_PRIVACY].map((caller) =>
        isChildVisibleToCallerInOwnershipIndex({
          metadataOwnershipIndex,
          childMetadataName: 'viewField',
          childId: 'rootless-child',
          caller,
        }),
      ),
    ).toEqual([false, false, true]);
  });
});
