import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

const isWritePermittedByWritability = ({
  writability,
  owningApplicationId,
  authContext,
}: {
  writability: MetadataWritability | undefined;
  owningApplicationId: string | undefined;
  authContext: WorkspaceAuthContext | undefined;
}): boolean => {
  if (!isDefined(writability) || writability === MetadataWritability.OPEN) {
    return true;
  }

  if (writability === MetadataWritability.APPLICATION) {
    return (
      isDefined(authContext) &&
      isApplicationAuthContext(authContext) &&
      isDefined(owningApplicationId) &&
      authContext.application.id === owningApplicationId
    );
  }

  return false;
};

type ValidateWritabilityOrThrowArgs = {
  operationType: string;
  objectMetadata: FlatObjectMetadata;
  updatedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  authContext: WorkspaceAuthContext | undefined;
};

export const validateWritabilityOrThrow = ({
  operationType,
  objectMetadata,
  updatedColumns,
  columnNameToFieldMetadataIdMap,
  flatFieldMetadataMaps,
  authContext,
}: ValidateWritabilityOrThrowArgs): void => {
  if (operationType === 'select') {
    return;
  }

  if (
    !isWritePermittedByWritability({
      writability: objectMetadata.writability,
      owningApplicationId: objectMetadata.applicationId,
      authContext,
    })
  ) {
    throw new PermissionsException(
      `${PermissionsExceptionMessage.PERMISSION_DENIED}: records of "${objectMetadata.nameSingular}" are not writable through the API`,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  for (const column of updatedColumns) {
    const fieldMetadataId = columnNameToFieldMetadataIdMap[column];

    if (!isDefined(fieldMetadataId)) {
      continue;
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      continue;
    }

    if (
      !isWritePermittedByWritability({
        writability: fieldMetadata.writability,
        owningApplicationId: fieldMetadata.applicationId,
        authContext,
      })
    ) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.PERMISSION_DENIED}: field "${fieldMetadata.name}" on "${objectMetadata.nameSingular}" is not writable through the API`,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};
