import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
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
  const { objectFlatFieldMetadatas } = findObjectFlatFieldMetadatasOrThrow({
    flatFieldMetadataMaps,
    flatObjectMetadata,
  });
  const reservedCompositeFieldsNames = getReservedCompositeFieldNames(
    objectFlatFieldMetadatas,
  );
  const flatFieldMetadataName = flatFieldMetadata.name;

  if (
    !isFlatFieldMetadataOfType(
      // CHALLENGE Could remove the is morph relation assertion
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    ) &&
    objectFlatFieldMetadatas.some((existingFlatFieldMetadata) => {
      const firstDegreeCollision =
        existingFlatFieldMetadata.name === flatFieldMetadataName;

      if (firstDegreeCollision) {
        return true;
      }

      if (!isMorphOrRelationFlatFieldMetadata(existingFlatFieldMetadata)) {
        return false;
      }

      const targetFlatFieldMetadata =
        remainingFlatEntityMapsToValidate?.byId[
          existingFlatFieldMetadata.relationTargetFieldMetadataId
        ] ??
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: existingFlatFieldMetadata.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

      if (!isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)) {
        return false;
      }

      return (
        targetFlatFieldMetadata.settings.joinColumnName ===
        flatFieldMetadataName
      );
    })
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
      userFriendlyMessage: t`Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
    });
  }

  if (reservedCompositeFieldsNames.includes(flatFieldMetadataName)) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${flatFieldMetadataName}" is reserved composite field name`,
      value: flatFieldMetadataName,
      userFriendlyMessage: t`Name "${flatFieldMetadataName}" is not available`,
    });
  }

  return errors;
};
