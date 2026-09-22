import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatWorkflowValidatorService {
  public validateFlatWorkflowCreation({
    flatEntityToValidate: flatWorkflow,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowMaps: optimisticFlatWorkflowMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.workflow
  >): FailedFlatEntityValidation<'workflow', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatWorkflow.universalIdentifier,
        name: flatWorkflow.name ?? undefined,
      },
      metadataName: 'workflow',
      type: 'create',
    });

    const existingWorkflow = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatWorkflow.universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (isDefined(existingWorkflow)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_ALREADY_EXISTS,
        message: t`Workflow already exists`,
        userFriendlyMessage: msg`This workflow already exists`,
      });
    }

    return validationResult;
  }

  public validateFlatWorkflowDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowMaps: optimisticFlatWorkflowMaps,
      flatWorkflowVersionMaps: optimisticFlatWorkflowVersionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.workflow
  >): FailedFlatEntityValidation<'workflow', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name ?? undefined,
      },
      metadataName: 'workflow',
      type: 'delete',
    });

    const existingWorkflow = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (!isDefined(existingWorkflow)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        message: t`Workflow not found`,
        userFriendlyMessage: msg`Workflow not found`,
      });

      return validationResult;
    }

    // Versions deleted by the same migration are already gone from the
    // optimistic maps, so anything left here would outlive its workflow.
    const remainingFlatWorkflowVersions = Object.values(
      optimisticFlatWorkflowVersionMaps.byUniversalIdentifier,
    ).filter(
      (flatWorkflowVersion) =>
        flatWorkflowVersion?.coreWorkflowId === existingWorkflow.id,
    );

    if (isNonEmptyArray(remainingFlatWorkflowVersions)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_MISSING_WORKFLOW,
        message: t`Workflow still has versions`,
        userFriendlyMessage: msg`This workflow still has versions`,
      });
    }

    return validationResult;
  }

  public validateFlatWorkflowUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowMaps: optimisticFlatWorkflowMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.workflow
  >): FailedFlatEntityValidation<'workflow', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'workflow',
      type: 'update',
    });

    const existingWorkflow = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (!isDefined(existingWorkflow)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        message: t`Workflow not found`,
        userFriendlyMessage: msg`Workflow not found`,
      });
    }

    return validationResult;
  }
}
