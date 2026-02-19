import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { buildUniversalFlatObjectFieldByNameAndJoinColumnMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/build-universal-flat-object-field-by-name-and-join-column-maps.util';

type ValidateObjectMetadataSystemFieldsIntegrityArgs = {
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'fieldMetadata' | 'objectMetadata'
  >;
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
};
export const validateObjectMetadataSystemFieldsIntegrity = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
}: ValidateObjectMetadataSystemFieldsIntegrityArgs): Pick<
  OrchestratorFailureReport,
  'objectMetadata'
> => {
  const metadataValidationErrors: Pick<
    OrchestratorFailureReport,
    'objectMetadata'
  > = {
    objectMetadata: [],
  };

  const createdObjectMetadatas =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
      universalIdentifiers: orchestratorActionsReport.objectMetadata.create.map(
        (createObjectAction) =>
          createObjectAction.flatEntity.universalIdentifier,
      ),
      flatEntityMaps: optimisticUniversalFlatMaps.flatObjectMetadataMaps,
    });

  for (const createdObjectMetadata of createdObjectMetadatas) {
    const createdFailedFlatEntityValidations: FailedFlatEntityValidation<
      'objectMetadata',
      'create'
    > = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: createdObjectMetadata.universalIdentifier,
        namePlural: createdObjectMetadata.namePlural,
        nameSingular: createdObjectMetadata.nameSingular,
      },
      metadataName: 'objectMetadata',
      type: 'create',
    });

    const { fieldUniversalIdentifierByName } =
      buildUniversalFlatObjectFieldByNameAndJoinColumnMaps({
        flatFieldMetadataMaps:
          optimisticUniversalFlatMaps.flatFieldMetadataMaps,
        flatObjectMetadata: createdObjectMetadata,
      });

    for (const expectedSystemField of Object.values(
      PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
    )) {
      const matchingFieldUniversalIdentifier =
        fieldUniversalIdentifierByName[expectedSystemField.name];

      const expectedFieldName = expectedSystemField.name;

      if (!isDefined(matchingFieldUniversalIdentifier)) {
        createdFailedFlatEntityValidations.errors.push({
          code: ObjectMetadataExceptionCode.MISSING_SYSTEM_FIELD,
          message: `System field ${expectedFieldName} is missing`,
          userFriendlyMessage: msg`System field ${expectedFieldName} is missing`,
          value: expectedFieldName,
        });
      } else {
        const universalFlatFieldMetadata =
          findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps: optimisticUniversalFlatMaps.flatFieldMetadataMaps,
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
            createdFailedFlatEntityValidations.errors.push({
              code: ObjectMetadataExceptionCode.INVALID_SYSTEM_FIELD,
              message: `System field ${expectedFieldName} has invalid ${property}: expected ${String(expectedValue)}, got ${String(actualValue)}`,
              userFriendlyMessage: msg`System field ${expectedFieldName} has invalid ${property}`,
              value: actualValue,
            });
          }
        }
      }
    }

    if (createdFailedFlatEntityValidations.errors.length > 0) {
      metadataValidationErrors.objectMetadata.push(
        createdFailedFlatEntityValidations,
      );
    }
  }

  return metadataValidationErrors;
};
