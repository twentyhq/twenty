import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceMetadataChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-metadata-change.type';
import { getDerivedWorkspaceCacheKeyNamesToInvalidate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-derived-workspace-cache-key-names-to-invalidate.util';

const change = (
  metadataName: AllMetadataName,
  actionType: WorkspaceMigrationActionType,
  updatedProperties?: string[],
): WorkspaceMetadataChange => ({
  metadataName,
  actionType,
  updatedProperties,
});

describe('getDerivedWorkspaceCacheKeyNamesToInvalidate', () => {
  it.each<[string, WorkspaceMetadataChange[], WorkspaceCacheKeyName[]]>([
    [
      'a role target assignment',
      [change('roleTarget', 'create')],
      ['userWorkspaceRoleMap', 'apiKeyRoleMap', 'flatRoleTargetByAgentIdMaps'],
    ],
    [
      'a role target reassignment',
      [change('roleTarget', 'update', ['roleUniversalIdentifier'])],
      ['userWorkspaceRoleMap', 'apiKeyRoleMap', 'flatRoleTargetByAgentIdMaps'],
    ],
    [
      'a role creation',
      [change('role', 'create')],
      ['rolesPermissions', 'roleIdsWithAllRecordsAccess'],
    ],
    [
      'a role deletion',
      [change('role', 'delete')],
      [
        'rolesPermissions',
        'roleIdsWithAllRecordsAccess',
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
        'flatRoleTargetByAgentIdMaps',
      ],
    ],
    [
      'a role record permission update',
      [change('role', 'update', ['canReadAllObjectRecords'])],
      ['rolesPermissions'],
    ],
    [
      'a role settings permission update',
      [change('role', 'update', ['canUpdateAllSettings'])],
      ['rolesPermissions', 'roleIdsWithAllRecordsAccess'],
    ],
    ['a role label update', [change('role', 'update', ['label', 'icon'])], []],
    [
      'an object permission upsert',
      [
        change('objectPermission', 'create'),
        change('objectPermission', 'update'),
      ],
      ['rolesPermissions'],
    ],
    [
      'a field permission upsert',
      [
        change('fieldPermission', 'create'),
        change('fieldPermission', 'delete'),
      ],
      ['rolesPermissions'],
    ],
    [
      'a permission flag grant',
      [change('rolePermissionFlag', 'create')],
      ['rolesPermissions'],
    ],
    ['a permission flag creation', [change('permissionFlag', 'create')], []],
    [
      'a permission flag deletion',
      [change('permissionFlag', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'a row level permission predicate upsert',
      [change('rowLevelPermissionPredicate', 'create')],
      ['rolesPermissions'],
    ],
    [
      'a row level permission predicate group deletion',
      [change('rowLevelPermissionPredicateGroup', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an object creation',
      [change('objectMetadata', 'create'), change('fieldMetadata', 'create')],
      ['rolesPermissions'],
    ],
    [
      'an object deletion',
      [change('objectMetadata', 'delete'), change('fieldMetadata', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an object label identifier update',
      [
        change('objectMetadata', 'update', [
          'labelIdentifierFieldMetadataUniversalIdentifier',
        ]),
      ],
      ['rolesPermissions'],
    ],
    [
      'an object rename',
      [change('objectMetadata', 'update', ['labelSingular', 'labelPlural'])],
      [],
    ],
    ['a field creation', [change('fieldMetadata', 'create')], []],
    [
      'a field deletion',
      [change('fieldMetadata', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an agent deletion',
      [change('agent', 'delete')],
      ['flatRoleTargetByAgentIdMaps', 'flatRoleTargetMaps'],
    ],
    ['an agent update', [change('agent', 'update', ['prompt'])], []],
    [
      'an application variable update',
      [change('applicationVariable', 'update', ['value'])],
      ['applicationVariableMaps'],
    ],
    ['a view creation', [change('view', 'create')], []],
    ['no change', [], []],
  ])(
    'invalidates the expected caches for %s',
    (_, metadataChanges, expected) => {
      expect(
        getDerivedWorkspaceCacheKeyNamesToInvalidate(metadataChanges),
      ).toEqual(expected);
    },
  );

  it('treats an update with unknown properties as touching every property', () => {
    expect(
      getDerivedWorkspaceCacheKeyNamesToInvalidate([change('role', 'update')]),
    ).toEqual(['rolesPermissions', 'roleIdsWithAllRecordsAccess']);
  });
});
