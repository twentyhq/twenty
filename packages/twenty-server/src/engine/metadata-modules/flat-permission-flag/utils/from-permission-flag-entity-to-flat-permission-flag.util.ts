import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromPermissionFlagEntityToFlatPermissionFlag = ({
  entity: permissionFlagEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'permissionFlag'>): FlatPermissionFlag => {
  const entityWithoutRelations = removePropertiesFromRecord(
    permissionFlagEntity,
    getMetadataEntityRelationProperties('permissionFlag'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      permissionFlagEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${permissionFlagEntity.applicationId} not found for permissionFlag ${permissionFlagEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...entityWithoutRelations,
    createdAt: permissionFlagEntity.createdAt.toISOString(),
    updatedAt: permissionFlagEntity.updatedAt.toISOString(),
    universalIdentifier: entityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    rolePermissionFlagIds: permissionFlagEntity.rolePermissionFlags.map(
      ({ id }) => id,
    ),
    rolePermissionFlagUniversalIdentifiers:
      permissionFlagEntity.rolePermissionFlags.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
  };
};
