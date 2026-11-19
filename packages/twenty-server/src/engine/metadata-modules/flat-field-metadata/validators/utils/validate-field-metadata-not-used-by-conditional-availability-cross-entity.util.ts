import { msg, t } from '@lingui/core/macro';
import {
  isDefined,
  listConditionalAvailabilityFieldMetadataUniversalIdentifiers,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validateFieldMetadataNotUsedByConditionalAvailabilityCrossEntity =
  ({
    fromFlatFieldMetadataMaps,
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
  }: {
    fromFlatFieldMetadataMaps:
      | MetadataUniversalFlatEntityMaps<'fieldMetadata'>
      | undefined;
    optimisticUniversalFlatMaps: Pick<
      AllUniversalFlatEntityMaps,
      'flatPageLayoutWidgetMaps'
    >;
    orchestratorActionsReport: Pick<
      OrchestratorActionsReport,
      'fieldMetadata' | 'objectMetadata'
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

    const ruleNodes = Object.values(
      optimisticUniversalFlatMaps.flatPageLayoutWidgetMaps
        .byUniversalIdentifier,
    )
      .flatMap((widget) => [
        widget?.conditionalAvailability,
        ...Object.values(widget?.universalOverrides ?? {}).map(
          (override) => override?.conditionalAvailability,
        ),
      ])
      .filter(isDefined);

    const ruleCountByFieldMetadataUniversalIdentifier = new Map<
      string,
      number
    >();

    for (const node of ruleNodes) {
      for (const fieldMetadataUniversalIdentifier of listConditionalAvailabilityFieldMetadataUniversalIdentifiers(
        { node },
      )) {
        ruleCountByFieldMetadataUniversalIdentifier.set(
          fieldMetadataUniversalIdentifier,
          (ruleCountByFieldMetadataUniversalIdentifier.get(
            fieldMetadataUniversalIdentifier,
          ) ?? 0) + 1,
        );
      }
    }

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
      const ruleCount =
        ruleCountByFieldMetadataUniversalIdentifier.get(
          deleteAction.universalIdentifier,
        ) ?? 0;

      if (
        !isDefined(fromFlatFieldMetadata) ||
        ruleCount === 0 ||
        deletedObjectUniversalIdentifiers.has(
          fromFlatFieldMetadata.objectMetadataUniversalIdentifier,
        )
      ) {
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
        message: t`Field ${fieldName} is used by ${ruleCount} visibility rule(s)`,
        userFriendlyMessage: msg`Remove the visibility rules that use this field before deleting it`,
      });

      validationErrors.fieldMetadata.push(failedValidation);
    }

    return validationErrors;
  };
