import { isObject, isString, isUndefined } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getMorphRelationTargetJoinColumnsByMorphName } from 'src/modules/workflow/workflow-executor/utils/get-morph-relation-target-join-columns-by-morph-name.util';
import { isNullRelationValue } from 'src/modules/workflow/workflow-executor/utils/is-null-relation-value.util';

type ExtractedMorphValue = {
  targetObjectMetadataId: string;
  id: string;
};

const extractMorphValue = (value: unknown): ExtractedMorphValue | null => {
  if (!isObject(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    isString(record.targetObjectMetadataId) &&
    isString(record.id) &&
    isDefined(record.id)
  ) {
    return {
      targetObjectMetadataId: record.targetObjectMetadataId,
      id: record.id,
    };
  }

  return null;
};

const extractLegacyRelationId = (value: unknown): string | undefined => {
  if (!isObject(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (Object.keys(record).length !== 1 || !isString(record.id)) {
    return undefined;
  }

  return record.id;
};

const formatWorkflowRecordMorphRelationFields = (
  record: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
): Record<string, unknown> => {
  const targetJoinColumnsByMorphName =
    getMorphRelationTargetJoinColumnsByMorphName(objectMetadataInfo);

  const formattedRecord: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    const targetJoinColumns = targetJoinColumnsByMorphName.get(key);

    if (!isDefined(targetJoinColumns)) {
      formattedRecord[key] = value;
      continue;
    }

    const clearJoinColumns = () => {
      for (const { joinColumnName } of targetJoinColumns) {
        formattedRecord[joinColumnName] = null;
      }
    };

    if (value === null) {
      clearJoinColumns();
      continue;
    }

    const morphValue = extractMorphValue(value);

    const matchingTargetJoinColumn = isDefined(morphValue)
      ? targetJoinColumns.find(
          (targetJoinColumn) =>
            targetJoinColumn.targetObjectMetadataId ===
            morphValue.targetObjectMetadataId,
        )
      : undefined;

    if (!isDefined(morphValue) || !isDefined(matchingTargetJoinColumn)) {
      continue;
    }

    clearJoinColumns();
    formattedRecord[matchingTargetJoinColumn.joinColumnName] = morphValue.id;
  }

  return formattedRecord;
};

const formatWorkflowRecordSimpleRelationFields = (
  record: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
): Record<string, unknown> => {
  const { flatObjectMetadata, flatFieldMetadataMaps } = objectMetadataInfo;

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const manyToOneRelationFieldNames = new Set<string>();

  for (const field of objectFields) {
    if (
      (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) &&
      field.settings.relationType === RelationType.MANY_TO_ONE
    ) {
      manyToOneRelationFieldNames.add(field.name);
    }
  }

  const formattedRecord: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (!manyToOneRelationFieldNames.has(key)) {
      formattedRecord[key] = value;
      continue;
    }

    const joinColumnValue = isNullRelationValue(value)
      ? null
      : extractLegacyRelationId(value);

    if (isUndefined(joinColumnValue)) {
      formattedRecord[key] = value;
      continue;
    }

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: key,
    });

    if (!isDefined(record[joinColumnName])) {
      formattedRecord[joinColumnName] = joinColumnValue;
    }
  }

  return formattedRecord;
};

export const formatWorkflowRecordRelationFields = (
  record: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
): Record<string, unknown> =>
  formatWorkflowRecordSimpleRelationFields(
    formatWorkflowRecordMorphRelationFields(record, objectMetadataInfo),
    objectMetadataInfo,
  );
