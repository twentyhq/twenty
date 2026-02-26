import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { buildUniversalFlatObjectFieldByNameAndJoinColumnMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/build-universal-flat-object-field-by-name-and-join-column-maps.util';

type ValidateObjectMetadataSystemFieldsIntegrityArgs = {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
};
export const validateObjectMetadataSystemFieldsIntegrity = ({
  universalFlatFieldMetadataMaps,
  universalFlatObjectMetadata,
}: ValidateObjectMetadataSystemFieldsIntegrityArgs): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const { fieldUniversalIdentifierByName } =
    buildUniversalFlatObjectFieldByNameAndJoinColumnMaps({
      flatFieldMetadataMaps: universalFlatFieldMetadataMaps,
      flatObjectMetadata: universalFlatObjectMetadata,
    });

  for (const expectedSystemField of Object.values(
    PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
  )) {
    const matchingFieldUniversalIdentifier =
      fieldUniversalIdentifierByName[expectedSystemField.name];

    const expectedFieldName = expectedSystemField.name;

    if (!isDefined(matchingFieldUniversalIdentifier)) {
      errors.push({
        code: ObjectMetadataExceptionCode.MISSING_SYSTEM_FIELD,
        message: `System field ${expectedFieldName} is missing`,
        userFriendlyMessage: msg`System field ${expectedFieldName} is missing`,
        value: expectedFieldName,
      });
    } else {
      const universalFlatFieldMetadata =
        findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: universalFlatFieldMetadataMaps,
          universalIdentifier: matchingFieldUniversalIdentifier,
        });

      const propertiesToValidate = [
        'type',
        'isSystem',
      ] as const satisfies (keyof UniversalFlatFieldMetadata)[];

      for (const property of propertiesToValidate) {
        const expectedValue = expectedSystemField[property];
        const actualValue = universalFlatFieldMetadata[property];

        if (actualValue !== expectedValue) {
          errors.push({
            code: ObjectMetadataExceptionCode.INVALID_SYSTEM_FIELD,
            message: `System field ${expectedFieldName} has invalid ${property}: expected ${String(expectedValue)}, got ${String(actualValue)}`,
            userFriendlyMessage: msg`System field ${expectedFieldName} has invalid ${property}`,
            value: actualValue,
          });
        }
      }
    }
  }

  return errors;
};
