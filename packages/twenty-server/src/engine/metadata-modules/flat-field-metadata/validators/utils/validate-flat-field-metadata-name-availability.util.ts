import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { writeFileSync } from 'fs';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getObjectFieldNamesAndJoinColumnNames } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-object-field-names-and-join-column-names.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
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
  flatFieldMetadata: FlatFieldMetadata;
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

  const { objectFieldNamesAndJoinColumnNames } =
    getObjectFieldNamesAndJoinColumnNames({
      flatFieldMetadataMaps,
      flatObjectMetadata,
      remainingFlatEntityMapsToValidate,
    });

  writeFileSync(
    `${Date.now()}-prastoin.json`,
    JSON.stringify(
      { objectFieldNamesAndJoinColumnNames, flatFieldMetadata },
      null,
      2,
    ),
  );

  if (
    objectFieldNamesAndJoinColumnNames.fieldNames.includes(
      flatFieldMetadata.name,
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
      userFriendlyMessage: msg`Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
    });
  }

  const collidingJoinColumnNameFieldId =
    objectFieldNamesAndJoinColumnNames.relationTargetFieldIdByJoinColumnName[
      flatFieldMetadata.name
    ];
  if (
    (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
      isDefined(collidingJoinColumnNameFieldId)) ||
    (isDefined(collidingJoinColumnNameFieldId) &&
      collidingJoinColumnNameFieldId !==
        flatFieldMetadata.relationTargetFieldMetadataId)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another join column name`,
      userFriendlyMessage: msg`Name "${flatFieldMetadataName}" is not available as it is already used by join column name`,
    });
  }

  return errors;
};
