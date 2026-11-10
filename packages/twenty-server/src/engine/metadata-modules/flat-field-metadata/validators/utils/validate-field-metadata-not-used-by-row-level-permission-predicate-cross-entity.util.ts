import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type WorkspaceRowLevelPermissionFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-row-level-permission-flat-entity-maps.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

type RowLevelPermissionPredicateReferences = Pick<
  FlatRowLevelPermissionPredicate,
  | 'universalIdentifier'
  | 'roleUniversalIdentifier'
  | 'objectMetadataUniversalIdentifier'
  | 'fieldMetadataUniversalIdentifier'
  | 'workspaceMemberFieldMetadataUniversalIdentifier'
  | 'relationFieldMetadataUniversalIdentifier'
  | 'deletedAt'
>;

const toUniversalIdentifierSet = (
  actions: { universalIdentifier: string }[],
): Set<string> =>
  new Set(actions.map(({ universalIdentifier }) => universalIdentifier));

// Rules of any application can use the field, while the migration maps only hold the applications it touches
export const validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity =
  ({
    workspaceRowLevelPermissionFlatEntityMaps,
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
  }: {
    workspaceRowLevelPermissionFlatEntityMaps: WorkspaceRowLevelPermissionFlatEntityMaps;
    optimisticUniversalFlatMaps: Pick<
      AllUniversalFlatEntityMaps,
      'flatRowLevelPermissionPredicateMaps'
    >;
    orchestratorActionsReport: Pick<
      OrchestratorActionsReport,
      | 'fieldMetadata'
      | 'rowLevelPermissionPredicate'
      | 'role'
      | 'objectMetadata'
    >;
  }): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
    const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
      fieldMetadata: [],
    };

    const deletedFieldActions = orchestratorActionsReport.fieldMetadata.delete;

    if (deletedFieldActions.length === 0) {
      return validationErrors;
    }

    const deletedFieldUniversalIdentifiers =
      toUniversalIdentifierSet(deletedFieldActions);
    const deletedPredicateUniversalIdentifiers = toUniversalIdentifierSet(
      orchestratorActionsReport.rowLevelPermissionPredicate.delete,
    );
    const deletedRoleUniversalIdentifiers = toUniversalIdentifierSet(
      orchestratorActionsReport.role.delete,
    );
    const deletedObjectUniversalIdentifiers = toUniversalIdentifierSet(
      orchestratorActionsReport.objectMetadata.delete,
    );

    const survivingPredicates = new Map<
      string,
      RowLevelPermissionPredicateReferences
    >();

    for (const predicate of [
      ...Object.values(
        workspaceRowLevelPermissionFlatEntityMaps
          .flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
      ),
      ...Object.values(
        optimisticUniversalFlatMaps.flatRowLevelPermissionPredicateMaps
          .byUniversalIdentifier,
      ),
    ]) {
      if (
        !isDefined(predicate) ||
        isDefined(predicate.deletedAt) ||
        deletedPredicateUniversalIdentifiers.has(
          predicate.universalIdentifier,
        ) ||
        deletedRoleUniversalIdentifiers.has(
          predicate.roleUniversalIdentifier,
        ) ||
        deletedObjectUniversalIdentifiers.has(
          predicate.objectMetadataUniversalIdentifier,
        )
      ) {
        continue;
      }

      survivingPredicates.set(predicate.universalIdentifier, predicate);
    }

    const roleLabelsByDeletedFieldUniversalIdentifier = new Map<
      string,
      Set<string>
    >();

    for (const predicate of survivingPredicates.values()) {
      for (const fieldUniversalIdentifier of [
        predicate.fieldMetadataUniversalIdentifier,
        predicate.workspaceMemberFieldMetadataUniversalIdentifier,
        predicate.relationFieldMetadataUniversalIdentifier,
      ]) {
        if (
          !isDefined(fieldUniversalIdentifier) ||
          !deletedFieldUniversalIdentifiers.has(fieldUniversalIdentifier)
        ) {
          continue;
        }

        const roleLabels =
          roleLabelsByDeletedFieldUniversalIdentifier.get(
            fieldUniversalIdentifier,
          ) ?? new Set<string>();

        roleLabels.add(
          workspaceRowLevelPermissionFlatEntityMaps.flatRoleMaps
            .byUniversalIdentifier[predicate.roleUniversalIdentifier]?.label ??
            predicate.roleUniversalIdentifier,
        );
        roleLabelsByDeletedFieldUniversalIdentifier.set(
          fieldUniversalIdentifier,
          roleLabels,
        );
      }
    }

    for (const deleteAction of deletedFieldActions) {
      const roleLabels = roleLabelsByDeletedFieldUniversalIdentifier.get(
        deleteAction.universalIdentifier,
      );

      if (!isDefined(roleLabels)) {
        continue;
      }

      const fieldName =
        deleteAction.flatEntity?.name ?? deleteAction.universalIdentifier;
      const roleLabelList = [...roleLabels].join(', ');

      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: {
          universalIdentifier: deleteAction.universalIdentifier,
          name: deleteAction.flatEntity?.name,
          objectMetadataUniversalIdentifier:
            deleteAction.flatEntity?.objectMetadataUniversalIdentifier,
        },
        metadataName: 'fieldMetadata',
        type: 'delete',
      });

      failedValidation.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: t`Field ${fieldName} is used by row-level permission rules of roles: ${roleLabelList}`,
        userFriendlyMessage: msg`Remove the row-level permission rules that use this field before deleting it`,
      });

      validationErrors.fieldMetadata.push(failedValidation);
    }

    return validationErrors;
  };
