import { msg } from '@lingui/core/macro';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { getObjectFieldNamesAndJoinColumnNames } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-object-field-names-and-join-column-names.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const getReservedCompositeFieldNames = (
  objectUniversalFlatFieldMetadatas: UniversalFlatFieldMetadata[],
): string[] => {
  return objectUniversalFlatFieldMetadatas.flatMap(
    (universalFlatFieldMetadata) => {
      if (isCompositeFieldMetadataType(universalFlatFieldMetadata.type)) {
        const base = universalFlatFieldMetadata.name;
        const compositeType = compositeTypeDefinitions.get(
          universalFlatFieldMetadata.type,
        );

        if (!isDefined(compositeType)) {
          return [];
        }

        return compositeType.properties.map((property) =>
          computeCompositeColumnName(base, property),
        );
      }

      return [];
    },
  );
};

export const validateFlatFieldMetadataNameAvailability = ({
  name,
  universalFlatFieldMetadataMaps,
  universalFlatObjectMetadata,
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
  name: string;
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const objectUniversalFlatFieldMetadatas =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: universalFlatFieldMetadataMaps,
      universalIdentifiers:
        universalFlatObjectMetadata.fieldUniversalIdentifiers,
    });
  const reservedCompositeFieldsNames = getReservedCompositeFieldNames(
    objectUniversalFlatFieldMetadatas,
  );

  if (
    !isCallerTwentyStandardApp(buildOptions) &&
    reservedCompositeFieldsNames.includes(name)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${name}" is reserved composite field name`,
      value: name,
      userFriendlyMessage: msg`Name "${name}" is not available`,
    });
  }

  const { objectFieldNamesAndJoinColumnNames } =
    getObjectFieldNamesAndJoinColumnNames({
      universalFlatFieldMetadataMaps,
      universalFlatObjectMetadata,
    });

  if (objectFieldNamesAndJoinColumnNames.fieldNames.includes(name)) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: name,
      message: `Name "${name}" is not available as it is already used by another field`,
      userFriendlyMessage: msg`Name "${name}" is not available as it is already used by another field`,
    });
  }

  if (objectFieldNamesAndJoinColumnNames.joinColumnNames.includes(name)) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: name,
      message: `Name "${name}" is not available as it is already used by another join column name`,
      userFriendlyMessage: msg`Name "${name}" is not available as it is already used by join column name`,
    });
  }

  return errors;
};
