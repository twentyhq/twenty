import { msg } from '@lingui/core/macro';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  OrchestratorActionsReport,
  OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const buildUniversalFlatObjectFieldByNameAndJoinColumnMaps = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: {
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatObjectMetadata: UniversalFlatObjectMetadata;
}) => {
  const fieldUniversalIdentifierByName: Record<string, string> = {};
  const fieldUniversalIdentifierByJoinColumnName: Record<string, string> = {};

  const objectFields =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
      universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  for (const field of objectFields) {
    fieldUniversalIdentifierByName[field.name] = field.universalIdentifier;

    if (isMorphOrRelationUniversalFlatFieldMetadata(field)) {
      if (isDefined(field.universalSettings.joinColumnName)) {
        fieldUniversalIdentifierByJoinColumnName[
          field.universalSettings.joinColumnName
        ] = field.universalIdentifier;
      }
    }
  }

  return {
    fieldUniversalIdentifierByName,
    fieldUniversalIdentifierByJoinColumnName,
  };
};

const EXPECTED_SYSTEM_FIELDS = [
  {
    name: 'id',
    type: FieldMetadataType.UUID,
    isSystem: true,
  },
  {
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    isSystem: false,
  },
  {
    name: 'updatedAt',
    type: FieldMetadataType.DATE_TIME,
    isSystem: false,
  },
  {
    name: 'deletedAt',
    type: FieldMetadataType.DATE_TIME,
    isSystem: false,
  },
  {
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
    isSystem: false,
  },
  {
    name: 'updatedBy',
    type: FieldMetadataType.ACTOR,
    isSystem: false,
  },
  {
    name: 'position',
    type: FieldMetadataType.POSITION,
    isSystem: true,
  },
  {
    name: 'searchVector',
    type: FieldMetadataType.TS_VECTOR,
    isSystem: true,
  },
] as const satisfies Partial<UniversalFlatFieldMetadata>[];

type PrastoinArgs = {
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
}: PrastoinArgs): Pick<OrchestratorFailureReport, 'objectMetadata'> => {
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

    for (const expectedSystemField of EXPECTED_SYSTEM_FIELDS) {
      const matchingFieldUniversalIdentifier =
        fieldUniversalIdentifierByName[expectedSystemField.name];
      if (!isDefined(matchingFieldUniversalIdentifier)) {
        createdFailedFlatEntityValidations.errors.push({
          code: ObjectMetadataExceptionCode.MISSING_SYSTEM_FIELD,
          message: `System field ${expectedSystemField.name} is missing`,
          userFriendlyMessage: msg`System field ${expectedSystemField.name} is missing`,
          value: expectedSystemField.name,
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
              message: `System field ${expectedSystemField.name} has invalid ${property}: expected ${String(expectedValue)}, got ${String(actualValue)}`,
              userFriendlyMessage: msg`System field ${expectedSystemField.name} has invalid ${property}`,
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
