import { isNonEmptyString } from '@sniptt/guards';
import { getFilterValueValidationIssue, isDefined } from 'twenty-shared/utils';
import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  recordFilterSchema,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { type WorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getFindRecordsFilterValueIssues = ({
  step,
  flatFieldMetadataMaps,
}: {
  step: Pick<WorkflowFindRecordsAction, 'id' | 'name' | 'settings'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): WorkflowValidationIssue[] =>
  (step.settings.input.filter?.recordFilters ?? []).flatMap(
    (rawRecordFilter: unknown): WorkflowValidationIssue[] => {
      const parsedRecordFilter = recordFilterSchema.safeParse(rawRecordFilter);

      if (!parsedRecordFilter.success) {
        return [];
      }

      const recordFilter = parsedRecordFilter.data;
      const { value } = recordFilter;

      // Variables are only resolved when the step runs
      if (
        !isNonEmptyString(value) ||
        isDefined(value.match(CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX))
      ) {
        return [];
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: recordFilter.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(flatFieldMetadata)) {
        return [];
      }

      const relationTargetFlatFieldMetadata = isDefined(
        recordFilter.relationTargetFieldMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: recordFilter.relationTargetFieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;

      const issue = getFilterValueValidationIssue({
        fieldType: getEffectiveFilterFieldType({
          fieldType: flatFieldMetadata.type,
          relationTargetFieldType: relationTargetFlatFieldMetadata?.type,
        }),
        operand: recordFilter.operand,
        subFieldName: recordFilter.subFieldName,
        value,
      });

      if (!isDefined(issue)) {
        return [];
      }

      return [
        {
          severity: 'error',
          code: 'INVALID_RECORD_FILTER_VALUE',
          message:
            `Step "${step.name ?? step.id}" filters "${flatFieldMetadata.name}" with value "${issue.stringifiedValue}", which is not valid for operand "${issue.operand}" on field type "${issue.filterType}". ${issue.hint}`.trim(),
          stepId: step.id,
        },
      ];
    },
  );
