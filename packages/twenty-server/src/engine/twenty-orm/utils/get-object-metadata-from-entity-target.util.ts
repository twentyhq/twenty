import {
  type EntitySchema,
  type EntityTarget,
  type ObjectLiteral,
} from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): FlatObjectMetadata => {
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

  const objectMetadataId =
    internalContext.objectIdByNameSingular[objectMetadataName];

  if (!objectMetadataId) {
    throw new TwentyORMException(
      `Object metadata for object "${objectMetadataName}" is missing ` +
        `in workspace "${internalContext.workspaceId}" ` +
        `with object metadata collection length: ${
          Object.keys(internalContext.objectIdByNameSingular).length
        }`,
      TwentyORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadata =
    internalContext.flatObjectMetadataMaps.byId[objectMetadataId];

  if (!objectMetadata) {
    throw new TwentyORMException(
      `Object metadata for object "${objectMetadataName}" (id: ${objectMetadataId}) is missing`,
      TwentyORMExceptionCode.MALFORMED_METADATA,
    );
  }

  return objectMetadata;
};
