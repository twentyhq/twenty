import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { computeFlatEntityAndRelatedFlatEntitiesToDelete } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-and-related-flat-entities-to-delete.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

const SYNCABLE = {
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  createdAt: '2026-11-03T00:00:00.000Z',
  updatedAt: '2026-11-03T00:00:00.000Z',
};

const objectPermission = {
  ...SYNCABLE,
  id: 'object-permission-id',
  universalIdentifier: 'object-permission',
  roleUniversalIdentifier: 'role',
} as FlatObjectPermission;

const roleTarget = {
  ...SYNCABLE,
  id: 'role-target-id',
  universalIdentifier: 'role-target',
  roleUniversalIdentifier: 'role',
} as FlatRoleTarget;

const childGroup = {
  ...SYNCABLE,
  id: 'child-group-id',
  universalIdentifier: 'child-group',
  roleUniversalIdentifier: 'other-role',
  childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
} as unknown as FlatRowLevelPermissionPredicateGroup;

const parentGroup = {
  ...childGroup,
  id: 'parent-group-id',
  universalIdentifier: 'parent-group',
  childRowLevelPermissionPredicateGroupUniversalIdentifiers: [
    childGroup.universalIdentifier,
  ],
} as unknown as FlatRowLevelPermissionPredicateGroup;

const role = {
  ...SYNCABLE,
  id: 'role-id',
  universalIdentifier: 'role',
  objectPermissionUniversalIdentifiers: [objectPermission.universalIdentifier],
  roleTargetUniversalIdentifiers: [roleTarget.universalIdentifier],
  fieldPermissionUniversalIdentifiers: [],
  rolePermissionFlagUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  agentChatChannelRoleUniversalIdentifiers: [],
} as unknown as FlatRole;

const buildFlatEntityMaps = (): AllFlatEntityMaps => {
  const flatEntityMaps = createEmptyAllFlatEntityMaps();

  flatEntityMaps.flatRoleMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: role,
    flatEntityMaps: flatEntityMaps.flatRoleMaps,
  });
  flatEntityMaps.flatObjectPermissionMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: objectPermission,
      flatEntityMaps: flatEntityMaps.flatObjectPermissionMaps,
    });
  flatEntityMaps.flatRoleTargetMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: roleTarget,
    flatEntityMaps: flatEntityMaps.flatRoleTargetMaps,
  });

  for (const group of [parentGroup, childGroup]) {
    flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: group,
        flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      });
  }

  return flatEntityMaps;
};

describe('computeFlatEntityAndRelatedFlatEntitiesToDelete', () => {
  it('deletes an entity with the entities that require it', () => {
    const operations = computeFlatEntityAndRelatedFlatEntitiesToDelete({
      metadataName: 'role',
      flatEntity: role,
      flatEntityMaps: buildFlatEntityMaps(),
    });

    expect(operations).toEqual({
      role: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: [role],
      },
      objectPermission: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: [objectPermission],
      },
      roleTarget: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: [roleTarget],
      },
    });
  });

  it('does not follow optional links', () => {
    const operations = computeFlatEntityAndRelatedFlatEntitiesToDelete({
      metadataName: 'rowLevelPermissionPredicateGroup',
      flatEntity: parentGroup,
      flatEntityMaps: buildFlatEntityMaps(),
    });

    expect(
      operations.rowLevelPermissionPredicateGroup?.flatEntityToDelete,
    ).toEqual([parentGroup]);
  });

  it('throws beyond the maximum depth', () => {
    expect(() =>
      computeFlatEntityAndRelatedFlatEntitiesToDelete({
        metadataName: 'role',
        flatEntity: role,
        flatEntityMaps: buildFlatEntityMaps(),
        maxDepth: 0,
      }),
    ).toThrow('beyond the maximum depth of 0');
  });
});
