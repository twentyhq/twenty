import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  type WorkspaceAuthContext,
  type WorkspaceAuthContextType,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MetadataOwnershipException } from 'src/engine/metadata-modules/metadata-ownership/exceptions/metadata-ownership.exception';
import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { resolveMetadataCallerOrThrow } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-metadata-caller-or-throw.util';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';
const OTHER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000003';

const buildAuthContext = (
  type: WorkspaceAuthContextType,
): WorkspaceAuthContext =>
  ({
    type,
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: USER_WORKSPACE_ID,
  }) as WorkspaceAuthContext;

describe('resolveMetadataCallerOrThrow', () => {
  it.each<[WorkspaceAuthContextType, MetadataCaller]>([
    ['user', { type: 'workspaceMember', userWorkspaceId: USER_WORKSPACE_ID }],
    [
      'pendingActivationUser',
      { type: 'workspaceMember', userWorkspaceId: USER_WORKSPACE_ID },
    ],
    ['apiKey', { type: 'withoutWorkspaceMember' }],
    ['application', { type: 'withoutWorkspaceMember' }],
    ['system', { type: 'bypassesPrivacy' }],
  ])('resolves a %s auth context', (type, expectedCaller) => {
    expect(resolveMetadataCallerOrThrow(buildAuthContext(type))).toEqual(
      expectedCaller,
    );
  });

  it('falls back to the auth context of the running request', () => {
    expect(
      workspaceAuthContextStorage.run(buildAuthContext('user'), () =>
        resolveMetadataCallerOrThrow(),
      ),
    ).toEqual({
      type: 'workspaceMember',
      userWorkspaceId: USER_WORKSPACE_ID,
    });
  });

  it('prefers the auth context it is given over the running one', () => {
    const explicitAuthContext = {
      type: 'user',
      workspace: { id: WORKSPACE_ID },
      userWorkspaceId: OTHER_USER_WORKSPACE_ID,
    } as WorkspaceAuthContext;

    expect(
      workspaceAuthContextStorage.run(buildAuthContext('user'), () =>
        resolveMetadataCallerOrThrow(explicitAuthContext),
      ),
    ).toEqual({
      type: 'workspaceMember',
      userWorkspaceId: OTHER_USER_WORKSPACE_ID,
    });
  });

  it('throws instead of resolving a caller that would see everything', () => {
    expect(() => resolveMetadataCallerOrThrow()).toThrow(
      MetadataOwnershipException,
    );
  });
});
