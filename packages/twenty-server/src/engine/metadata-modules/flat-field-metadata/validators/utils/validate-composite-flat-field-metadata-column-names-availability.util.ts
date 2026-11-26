import { msg } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeFieldColumnNames } from 'src/engine/metadata-modules/field-metadata/utils/compute-composite-field-column-names.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { getObjectFieldNamesAndJoinColumnNames } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-object-field-names-and-join-column-names.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const validateCompositeFlatFieldMetadataColumnNamesAvailability = ({
  name,
  type,
  universalFlatFieldMetadataMaps,
  universalFlatObjectMetadata,
}: {
  name: string;
  type: FieldMetadataType;
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): FlatFieldMetadataValidationError[] => {
  const {
    objectFieldNamesAndJoinColumnNames: { fieldNames, joinColumnNames },
  } = getObjectFieldNamesAndJoinColumnNames({
    universalFlatFieldMetadataMaps,
    universalFlatObjectMetadata,
  });
  const takenColumnNames = new Set([...fieldNames, ...joinColumnNames]);

  return computeCompositeFieldColumnNames({ name, type })
    .filter((columnName) => takenColumnNames.has(columnName))
    .map((columnName) => ({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: name,
      message: `Name "${name}" is not available as its column "${columnName}" is already used by another field`,
      userFriendlyMessage: msg`Name "${name}" is not available as "${columnName}" is already used by another field`,
    }));
};
