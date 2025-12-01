import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

const getReservedCompositeFieldNames = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  const reservedCompositeFieldsNames: string[] = [];

  for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
    const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (isCompositeFieldMetadataType(field.type)) {
      const base = field.name;
      const compositeType = compositeTypeDefinitions.get(field.type);

      compositeType?.properties.map((property) =>
        reservedCompositeFieldsNames.push(
          computeCompositeColumnName(base, property),
        ),
      );
    }
  }

  return reservedCompositeFieldsNames;
};

type ValidateFieldNameAvailabilityOrThrowArgs = {
  name: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};
export const validateFieldNameAvailabilityOrThrow = ({
  name,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: ValidateFieldNameAvailabilityOrThrowArgs) => {
  const reservedCompositeFieldsNames = getReservedCompositeFieldNames(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
    const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (
      field.name === name ||
      (field.type === FieldMetadataType.RELATION && `${field.name}Id` === name)
    ) {
      throw new InvalidMetadataException(
        `Name "${name}" is not available as it is already used by another field`,
        InvalidMetadataExceptionCode.NOT_AVAILABLE,
        {
          userFriendlyMessage: msg`This name is not available as it is already used by another field.`,
        },
      );
    }
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new InvalidMetadataException(
      `Name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      {
        userFriendlyMessage: msg`This name is not available.`,
      },
    );
  }
};
