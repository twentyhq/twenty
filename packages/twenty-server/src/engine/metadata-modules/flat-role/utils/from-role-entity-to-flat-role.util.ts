import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';
import { type RegroupedEntity } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromRoleEntityToFlatRoleArgs = {
  entity: Omit<
    EntityWithRegroupedOneToManyRelations<MetadataEntity<'role'>>,
    'objectPermissions' | 'rolePermissionFlags' | 'fieldPermissions'
  > & {
    objectPermissions: RegroupedEntity[];
    rolePermissionFlags: RegroupedEntity[];
    fieldPermissions: RegroupedEntity[];
  };
} & EntityManyToOneIdByUniversalIdentifierMaps<'role'>;

export const fromRoleEntityToFlatRole = (
  args: FromRoleEntityToFlatRoleArgs,
): FlatRole => {
  const { entity: roleEntity } = args;

  const roleEntityWithoutRelations = removePropertiesFromRecord(
    roleEntity,
    getMetadataEntityRelationProperties('role'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'role',
      ...args,
    });

  return {
    ...roleEntityWithoutRelations,
    createdAt: roleEntity.createdAt.toISOString(),
    updatedAt: roleEntity.updatedAt.toISOString(),
    universalIdentifier: roleEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    roleTargetIds: roleEntity.roleTargets.map(({ id }) => id),
    objectPermissionIds: roleEntity.objectPermissions.map(({ id }) => id),
    rolePermissionFlagIds: roleEntity.rolePermissionFlags.map(({ id }) => id),
    fieldPermissionIds: roleEntity.fieldPermissions.map(({ id }) => id),
    rowLevelPermissionPredicateIds: roleEntity.rowLevelPermissionPredicates.map(
      ({ id }) => id,
    ),
    rowLevelPermissionPredicateGroupIds:
      roleEntity.rowLevelPermissionPredicateGroups.map(({ id }) => id),
    roleTargetUniversalIdentifiers: roleEntity.roleTargets.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    objectPermissionUniversalIdentifiers: roleEntity.objectPermissions.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    rolePermissionFlagUniversalIdentifiers: roleEntity.rolePermissionFlags.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    fieldPermissionUniversalIdentifiers: roleEntity.fieldPermissions.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    rowLevelPermissionPredicateUniversalIdentifiers:
      roleEntity.rowLevelPermissionPredicates.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    rowLevelPermissionPredicateGroupUniversalIdentifiers:
      roleEntity.rowLevelPermissionPredicateGroups.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
  };
};
