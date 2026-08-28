import { isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OBJECT_TARGETING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/object-targeting-action-types.constant';
import { getPickRecordLoadBalanceConfigError } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-pick-record-load-balance-config-error.util';
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD = new Set<string>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
]);

export const getWorkflowRecordStepMetadataIssues = ({
  steps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
}: {
  steps: WorkflowAction[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
}): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  for (const step of steps) {
    if (!OBJECT_TARGETING_ACTION_TYPES.has(step.type)) {
      continue;
    }

    const input = step.settings.input;
    const objectName =
      isObject(input) && 'objectName' in input ? input.objectName : undefined;

    if (!isString(objectName)) {
      issues.push({
        severity: 'error',
        code: 'OBJECT_NOT_FOUND',
        message: `Step "${step.name ?? step.id}" has an invalid object name.`,
        stepId: step.id,
      });

      continue;
    }

    const objectId = objectIdByNameSingular[objectName];

    if (!isDefined(objectId)) {
      issues.push({
        severity: 'error',
        code: 'OBJECT_NOT_FOUND',
        message: `Step "${step.name ?? step.id}" targets object "${objectName}" which does not exist in this workspace.`,
        stepId: step.id,
      });

      continue;
    }

    if (step.type === WorkflowActionType.PICK_RECORD) {
      const loadBalanceError = getPickRecordLoadBalanceConfigError({
        step,
        objectIdByNameSingular,
        flatFieldMetadataMaps,
      });

      if (isDefined(loadBalanceError)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_PICK_RECORD_CONFIG',
          message: loadBalanceError,
          stepId: step.id,
        });
      }
    }

    const objectRecord =
      RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD.has(step.type) &&
      isObject(input) &&
      'objectRecord' in input &&
      isObject(input.objectRecord)
        ? (input.objectRecord as Record<string, unknown>)
        : undefined;

    if (!isDefined(objectRecord)) {
      continue;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    issues.push(
      ...getRecordCrudRichTextIssues({
        objectRecord,
        objectMetadataInfo: { flatObjectMetadata, flatFieldMetadataMaps },
        stepLabel: step.name ?? step.id,
        stepId: step.id,
      }),
    );
  }

  return issues;
};
