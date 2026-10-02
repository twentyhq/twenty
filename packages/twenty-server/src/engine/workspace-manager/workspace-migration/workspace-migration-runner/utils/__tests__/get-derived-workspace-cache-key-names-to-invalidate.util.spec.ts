import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { getDerivedWorkspaceCacheKeyNamesToInvalidate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-derived-workspace-cache-key-names-to-invalidate.util';

type InvalidatingActions = NonNullable<
  Parameters<typeof getDerivedWorkspaceCacheKeyNamesToInvalidate>[0]['actions']
>;

type InvalidatingAction = InvalidatingActions[number];

const action = (
  metadataName: AllMetadataName,
  type: 'create' | 'delete',
): InvalidatingAction => ({ metadataName, type });

const updateAction = (
  metadataName: AllMetadataName,
  update: Extract<InvalidatingAction, { type: 'update' }>['update'],
): InvalidatingAction => ({ metadataName, type: 'update', update });

describe('getDerivedWorkspaceCacheKeyNamesToInvalidate', () => {
  it.each<[string, InvalidatingActions, WorkspaceCacheKeyName[]]>([
    [
      'a role target assignment',
      [action('roleTarget', 'create')],
      ['userWorkspaceRoleMap', 'apiKeyRoleMap', 'flatRoleTargetByAgentIdMaps'],
    ],
    [
      'a role target reassignment',
      [
        updateAction('roleTarget', {
          roleUniversalIdentifier: 'role-universal-identifier',
        }),
      ],
      ['userWorkspaceRoleMap', 'apiKeyRoleMap', 'flatRoleTargetByAgentIdMaps'],
    ],
    [
      'a role creation',
      [action('role', 'create')],
      ['rolesPermissions', 'roleIdsWithAllRecordsAccess'],
    ],
    [
      'a role deletion',
      [action('role', 'delete')],
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
      [updateAction('role', { canReadAllObjectRecords: true })],
      ['rolesPermissions'],
    ],
    [
      'a role settings permission update',
      [updateAction('role', { canUpdateAllSettings: true })],
      ['rolesPermissions', 'roleIdsWithAllRecordsAccess'],
    ],
    [
      'a role label update',
      [updateAction('role', { label: 'Sales', icon: 'IconUser' })],
      [],
    ],
    [
      'an object permission upsert',
      [
        action('objectPermission', 'create'),
        updateAction('objectPermission', { canReadObjectRecords: true }),
      ],
      ['rolesPermissions'],
    ],
    [
      'a field permission upsert',
      [
        action('fieldPermission', 'create'),
        action('fieldPermission', 'delete'),
      ],
      ['rolesPermissions'],
    ],
    [
      'a permission flag grant',
      [action('rolePermissionFlag', 'create')],
      ['rolesPermissions'],
    ],
    ['a permission flag creation', [action('permissionFlag', 'create')], []],
    [
      'a permission flag deletion',
      [action('permissionFlag', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'a row level permission predicate upsert',
      [action('rowLevelPermissionPredicate', 'create')],
      ['rolesPermissions'],
    ],
    [
      'a row level permission predicate group deletion',
      [action('rowLevelPermissionPredicateGroup', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an object creation',
      [action('objectMetadata', 'create'), action('fieldMetadata', 'create')],
      ['rolesPermissions'],
    ],
    [
      'an object deletion',
      [action('objectMetadata', 'delete'), action('fieldMetadata', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an object label identifier update',
      [
        updateAction('objectMetadata', {
          labelIdentifierFieldMetadataUniversalIdentifier:
            'field-universal-identifier',
        }),
      ],
      ['rolesPermissions'],
    ],
    [
      'an object rename',
      [
        updateAction('objectMetadata', {
          labelSingular: 'Company',
          labelPlural: 'Companies',
        }),
      ],
      [],
    ],
    ['a field creation', [action('fieldMetadata', 'create')], []],
    [
      'a field deletion',
      [action('fieldMetadata', 'delete')],
      ['rolesPermissions'],
    ],
    [
      'an agent deletion',
      [action('agent', 'delete')],
      ['flatRoleTargetByAgentIdMaps', 'flatRoleTargetMaps'],
    ],
    ['an agent update', [updateAction('agent', { prompt: 'Help' })], []],
    [
      'an application variable update',
      [updateAction('applicationVariable', { value: 'secret' })],
      ['applicationVariableMaps'],
    ],
    ['a view creation', [action('view', 'create')], []],
    ['no change', [], []],
  ])('invalidates the expected caches for %s', (_, actions, expected) => {
    expect(
      getDerivedWorkspaceCacheKeyNamesToInvalidate({
        allFlatEntityMapsKeys: [],
        actions,
      }),
    ).toEqual(expected);
  });

  it('assumes any change to the given maps when the actions are unknown', () => {
    expect(
      getDerivedWorkspaceCacheKeyNamesToInvalidate({
        allFlatEntityMapsKeys: [
          'flatRoleTargetMaps',
          'flatApplicationVariableMaps',
        ],
      }),
    ).toEqual([
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'applicationVariableMaps',
    ]);
  });
});
