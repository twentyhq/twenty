import { type EntityTarget, type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): FlatObjectMetadata => {
  if (typeof entityTarget !== 'string') {
    throw new TwentyORMException(
      'Entity target must be a string',
      TwentyORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadataName = entityTarget;

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
