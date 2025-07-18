import { EntitySchema, EntityTarget, ObjectLiteral } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): ObjectMetadataItemWithFieldMaps => {
  const objectMetadataName =
    typeof entityTarget === 'string'
      ? entityTarget
      : WorkspaceEntitiesStorage.getObjectMetadataName(
          internalContext.workspaceId,
          entityTarget as EntitySchema,
        );

  if (!objectMetadataName) {
    throw new TwentyORMException(
      'Object metadata name is missing',
      TwentyORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadata = getObjectMetadataMapItemByNameSingular(
    internalContext.objectMetadataMaps,
    objectMetadataName,
  );

  if (!objectMetadata) {
    throw new TwentyORMException(
      `Object metadata for object "${objectMetadataName}" is missing ` +
        `in workspace "${internalContext.workspaceId}" ` +
        `with object metadata collection length: ${
          Object.keys(internalContext.objectMetadataMaps.idByNameSingular)
            .length
        }`,
      TwentyORMExceptionCode.MALFORMED_METADATA,
    );
  }

  return objectMetadata;
};
