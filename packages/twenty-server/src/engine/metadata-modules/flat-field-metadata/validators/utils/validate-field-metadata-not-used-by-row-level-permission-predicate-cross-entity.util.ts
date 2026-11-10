import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

// The database would cascade or null the rule's reference, silently lifting its row restriction
export const validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity =
  ({
    fromFlatFieldMetadataMaps,
    orchestratorActionsReport,
  }: {
    fromFlatFieldMetadataMaps:
      | MetadataUniversalFlatEntityMaps<'fieldMetadata'>
      | undefined;
    orchestratorActionsReport: Pick<
      OrchestratorActionsReport,
      'fieldMetadata' | 'rowLevelPermissionPredicate' | 'objectMetadata'
    >;
  }): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
    const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
      fieldMetadata: [],
    };

    const deletedFieldActions = orchestratorActionsReport.fieldMetadata.delete;

    if (
      deletedFieldActions.length === 0 ||
      !isDefined(fromFlatFieldMetadataMaps)
    ) {
      return validationErrors;
    }

    const deletedPredicateUniversalIdentifiers = new Set(
      orchestratorActionsReport.rowLevelPermissionPredicate.delete.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    );
    const deletedObjectUniversalIdentifiers = new Set(
      orchestratorActionsReport.objectMetadata.delete.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    );

    for (const deleteAction of deletedFieldActions) {
      const fromFlatFieldMetadata =
        fromFlatFieldMetadataMaps.byUniversalIdentifier[
          deleteAction.universalIdentifier
        ];

      if (
        !isDefined(fromFlatFieldMetadata) ||
        deletedObjectUniversalIdentifiers.has(
          fromFlatFieldMetadata.objectMetadataUniversalIdentifier,
        )
      ) {
        continue;
      }

      const survivingPredicateCount = new Set(
        [
          ...fromFlatFieldMetadata.rowLevelPermissionPredicateUniversalIdentifiers,
          ...fromFlatFieldMetadata.relationRowLevelPermissionPredicateUniversalIdentifiers,
          ...fromFlatFieldMetadata.workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers,
        ].filter(
          (predicateUniversalIdentifier) =>
            !deletedPredicateUniversalIdentifiers.has(
              predicateUniversalIdentifier,
            ),
        ),
      ).size;

      if (survivingPredicateCount === 0) {
        continue;
      }

      const fieldName = fromFlatFieldMetadata.name;

      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: {
          universalIdentifier: deleteAction.universalIdentifier,
          name: fieldName,
          objectMetadataUniversalIdentifier:
            fromFlatFieldMetadata.objectMetadataUniversalIdentifier,
        },
        metadataName: 'fieldMetadata',
        type: 'delete',
      });

      failedValidation.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: t`Field ${fieldName} is used by ${survivingPredicateCount} row-level permission predicate(s)`,
        userFriendlyMessage: msg`Remove the row-level permission rules that use this field before deleting it`,
      });

      validationErrors.fieldMetadata.push(failedValidation);
    }

    return validationErrors;
  };
