import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { resolveOwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-ownable-root-privacy-state.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';
const OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';

describe('resolveOwnableRootPrivacyState', () => {
  it('reads a workspace view as shared, keeping its creator as owner', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'view',
        row: {
          visibility: ViewVisibility.WORKSPACE,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
      }),
    ).toEqual({
      isPrivate: false,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads an unlisted view as private', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'view',
        row: {
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
      }),
    ).toEqual({
      isPrivate: true,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads the visibility a view override makes effective', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'view',
        row: {
          visibility: ViewVisibility.WORKSPACE,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              visibility: ViewVisibility.UNLISTED,
            },
          },
        },
      }),
    ).toEqual({
      isPrivate: true,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads a view an override publishes to the workspace as shared', () => {
    expect(
      resolveOwnableRootPrivacyState({
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
      }),
    ).toEqual({
      isPrivate: false,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads a row with no readable visibility as private', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'view',
        row: { createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID },
      }),
    ).toEqual({
      isPrivate: true,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads a workspace workflow as shared', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'workflow',
        row: {
          visibility: WorkflowVisibility.WORKSPACE,
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
      }),
    ).toEqual({
      isPrivate: false,
      ownerUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
    });
  });

  it('reads a private workflow whose creator is gone as private and ownerless', () => {
    expect(
      resolveOwnableRootPrivacyState({
        rootMetadataName: 'workflow',
        row: {
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: null,
        },
      }),
    ).toEqual({ isPrivate: true, ownerUserWorkspaceId: null });
  });
});
