import {
  type WorkspaceCacheKeyName,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { partitionWorkspaceCacheKeyNames } from 'src/engine/workspace-cache/utils/partition-workspace-cache-key-names.util';

const SOURCE_KEY_NAMES_BY_DERIVED_KEY_NAME = {
  roleIdsWithAllRecordsAccess: ['flatRoleMaps'],
  userWorkspaceRoleMap: ['flatRoleTargetMaps'],
  apiKeyRoleMap: ['flatRoleTargetMaps'],
  flatRoleTargetByAgentIdMaps: ['flatRoleTargetMaps'],
  graphQLResolverNameMap: ['flatObjectMetadataMaps'],
} as const satisfies Record<
  WorkspaceDerivedCacheKeyName,
  readonly WorkspaceCacheKeyName[]
>;

const getSourceKeyNames = (derivedKeyName: WorkspaceDerivedCacheKeyName) =>
  SOURCE_KEY_NAMES_BY_DERIVED_KEY_NAME[derivedKeyName];

describe('partitionWorkspaceCacheKeyNames', () => {
  it('loads provider keys as requested when no derived key is requested', () => {
    expect(
      partitionWorkspaceCacheKeyNames({
        cacheKeyNames: ['flatObjectMetadataMaps', 'rolesPermissions'],
        getSourceKeyNames,
      }),
    ).toEqual({
      providerKeyNames: ['flatObjectMetadataMaps', 'rolesPermissions'],
      derivedKeyNames: [],
      providerKeyNamesToLoad: ['flatObjectMetadataMaps', 'rolesPermissions'],
    });
  });

  it('replaces derived keys with their deduplicated source keys', () => {
    expect(
      partitionWorkspaceCacheKeyNames({
        cacheKeyNames: [
          'rolesPermissions',
          'userWorkspaceRoleMap',
          'apiKeyRoleMap',
          'roleIdsWithAllRecordsAccess',
          'flatRoleMaps',
        ],
        getSourceKeyNames,
      }),
    ).toEqual({
      providerKeyNames: ['rolesPermissions', 'flatRoleMaps'],
      derivedKeyNames: [
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
        'roleIdsWithAllRecordsAccess',
      ],
      providerKeyNamesToLoad: [
        'rolesPermissions',
        'flatRoleMaps',
        'flatRoleTargetMaps',
      ],
    });
  });

  it('ignores duplicated requested keys', () => {
    expect(
      partitionWorkspaceCacheKeyNames({
        cacheKeyNames: [
          'graphQLResolverNameMap',
          'graphQLResolverNameMap',
          'flatObjectMetadataMaps',
        ],
        getSourceKeyNames,
      }),
    ).toEqual({
      providerKeyNames: ['flatObjectMetadataMaps'],
      derivedKeyNames: ['graphQLResolverNameMap'],
      providerKeyNamesToLoad: ['flatObjectMetadataMaps'],
    });
  });
});
