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
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD = new Set<string>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
]);

export const getRecordCrudRichTextIssuesForSteps = ({
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
    if (!RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD.has(step.type)) {
      continue;
    }

    const input =
      isObject(step.settings) && 'input' in step.settings
        ? step.settings.input
        : undefined;

    if (!isObject(input)) {
      continue;
    }

    const objectName = 'objectName' in input ? input.objectName : undefined;
    const objectRecord =
      'objectRecord' in input && isObject(input.objectRecord)
        ? (input.objectRecord as Record<string, unknown>)
        : undefined;

    if (!isString(objectName) || !isDefined(objectRecord)) {
      continue;
    }

    const objectId = objectIdByNameSingular[objectName];

    if (!isDefined(objectId)) {
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
