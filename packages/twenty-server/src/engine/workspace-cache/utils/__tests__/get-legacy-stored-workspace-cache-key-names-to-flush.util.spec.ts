import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { getLegacyStoredWorkspaceCacheKeyNamesToFlush } from 'src/engine/workspace-cache/utils/get-legacy-stored-workspace-cache-key-names-to-flush.util';

const SCHEMA_SOURCE_KEY_NAMES: WorkspaceCacheKeyName[] = [
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
];

const ROLE_SOURCE_KEY_NAMES: WorkspaceCacheKeyName[] = [
  'flatRoleMaps',
  'flatRoleTargetMaps',
  'flatObjectPermissionMaps',
  'flatFieldPermissionMaps',
  'flatRolePermissionFlagMaps',
];

describe('getLegacyStoredWorkspaceCacheKeyNamesToFlush', () => {
  it('flushes nothing when no legacy source changed', () => {
    expect(
      getLegacyStoredWorkspaceCacheKeyNamesToFlush(['flatViewMaps']),
    ).toEqual([]);
  });

  it.each(SCHEMA_SOURCE_KEY_NAMES)(
    'flushes the resolver name map when %s changes',
    (cacheKeyName) => {
      expect(
        getLegacyStoredWorkspaceCacheKeyNamesToFlush([cacheKeyName]),
      ).toEqual(['graphQLResolverNameMap']);
    },
  );

  it.each(ROLE_SOURCE_KEY_NAMES)(
    'flushes the role maps when %s changes',
    (cacheKeyName) => {
      expect(
        getLegacyStoredWorkspaceCacheKeyNamesToFlush([cacheKeyName]),
      ).toEqual([
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
        'roleIdsWithAllRecordsAccess',
        'flatRoleTargetByAgentIdMaps',
      ]);
    },
  );

  it('flushes the application variable maps when application variables change', () => {
    expect(
      getLegacyStoredWorkspaceCacheKeyNamesToFlush([
        'flatApplicationVariableMaps',
      ]),
    ).toEqual(['applicationVariableMaps']);
  });

  it('combines every legacy key whose sources changed', () => {
    expect(
      getLegacyStoredWorkspaceCacheKeyNamesToFlush([
        'flatFieldMetadataMaps',
        'flatRoleTargetMaps',
        'flatApplicationVariableMaps',
      ]),
    ).toEqual([
      'graphQLResolverNameMap',
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'roleIdsWithAllRecordsAccess',
      'flatRoleTargetByAgentIdMaps',
      'applicationVariableMaps',
    ]);
  });
});
