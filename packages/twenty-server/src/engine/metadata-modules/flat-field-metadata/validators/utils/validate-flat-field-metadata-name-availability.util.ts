import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getObjectFieldNamesAndJoinColumnNames } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-object-field-names-and-join-column-names.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getReservedCompositeFieldNames = (
  objectFlatFieldMetadatas: FlatFieldMetadata[],
): string[] => {
  return objectFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const base = flatFieldMetadata.name;
      const compositeType = compositeTypeDefinitions.get(
        flatFieldMetadata.type,
      );

      if (!isDefined(compositeType)) {
        return [];
      }

      return compositeType.properties.map((property) =>
        computeCompositeColumnName(base, property),
      );
    }

    return [];
  });
};

export const validateFlatFieldMetadataNameAvailability = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  remainingFlatEntityMapsToValidate,
  flatObjectMetadata,
}: {
  flatFieldMetadata: Pick<FlatFieldMetadata, 'type' | 'name'>;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  remainingFlatEntityMapsToValidate?: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });
  const reservedCompositeFieldsNames = getReservedCompositeFieldNames(
    objectFlatFieldMetadatas,
  );

  const { objectFieldNamesAndJoinColumnNames } =
    getObjectFieldNamesAndJoinColumnNames({
      flatFieldMetadataMaps,
      flatObjectMetadata,
      remainingFlatEntityMapsToValidate,
    });

  const flatFieldMetadataName = flatFieldMetadata.name;

  if (reservedCompositeFieldsNames.includes(flatFieldMetadataName)) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${flatFieldMetadataName}" is reserved composite field name`,
      value: flatFieldMetadataName,
      userFriendlyMessage: msg`Name "${flatFieldMetadataName}" is not available`,
    });
  }

  if (flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION) {
    return errors;
  }

  if (
    objectFieldNamesAndJoinColumnNames.names.includes(flatFieldMetadataName)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
      userFriendlyMessage: msg`Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
    });
  }

  if (
    objectFieldNamesAndJoinColumnNames.joinColumnNames.includes(
      flatFieldMetadataName,
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another field join column name`,
      userFriendlyMessage: msg`Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
    });
  }

  return errors;
};
