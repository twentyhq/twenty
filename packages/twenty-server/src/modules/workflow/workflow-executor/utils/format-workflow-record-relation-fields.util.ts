import { isObject, isString } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

type MorphRelationTargetJoinColumn = {
  joinColumnName: string;
  targetObjectMetadataId: string;
};

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
): {
  formattedRecord: Record<string, unknown>;
  joinColumnNamesByMorphFieldName: Record<string, string[]>;
} => {
  const { flatObjectMetadata, flatObjectMetadataMaps, flatFieldMetadataMaps } =
    objectMetadataInfo;

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const targetJoinColumnsByMorphFieldName = new Map<
    string,
    MorphRelationTargetJoinColumn[]
  >();

  for (const field of objectFields) {
    if (
      !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) ||
      field.settings.relationType !== RelationType.MANY_TO_ONE
    ) {
      continue;
    }

    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: field.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetObjectMetadata)) {
      continue;
    }

    const morphFieldName = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata: field,
      nameSingular: targetObjectMetadata.nameSingular,
      namePlural: targetObjectMetadata.namePlural,
    });

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: field.name,
    });

    const existing =
      targetJoinColumnsByMorphFieldName.get(morphFieldName) ?? [];

    targetJoinColumnsByMorphFieldName.set(morphFieldName, [
      ...existing,
      {
        joinColumnName,
        targetObjectMetadataId: field.relationTargetObjectMetadataId,
      },
    ]);
  }

  const formattedRecord: Record<string, unknown> = {};
  const joinColumnNamesByMorphFieldName: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(record)) {
    const targetJoinColumns = targetJoinColumnsByMorphFieldName.get(key);

    if (!isDefined(targetJoinColumns)) {
      formattedRecord[key] = value;
      continue;
    }

    const registerJoinColumns = () => {
      joinColumnNamesByMorphFieldName[key] = targetJoinColumns.map(
        (targetJoinColumn) => targetJoinColumn.joinColumnName,
      );

      for (const { joinColumnName } of targetJoinColumns) {
        formattedRecord[joinColumnName] = null;
      }
    };

    if (value === null) {
      registerJoinColumns();
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

    registerJoinColumns();
    formattedRecord[matchingTargetJoinColumn.joinColumnName] = morphValue.id;
  }

  return { formattedRecord, joinColumnNamesByMorphFieldName };
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

    const legacyId = extractLegacyRelationId(value);

    if (!isDefined(legacyId)) {
      formattedRecord[key] = value;
      continue;
    }

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: key,
    });

    if (!isDefined(record[joinColumnName])) {
      formattedRecord[joinColumnName] = legacyId;
    }
  }

  return formattedRecord;
};

export const formatWorkflowRecordRelationFields = (
  record: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
): {
  formattedRecord: Record<string, unknown>;
  joinColumnNamesByMorphFieldName: Record<string, string[]>;
} => {
  const {
    formattedRecord: recordWithMorphRelations,
    joinColumnNamesByMorphFieldName,
  } = formatWorkflowRecordMorphRelationFields(record, objectMetadataInfo);

  const formattedRecord = formatWorkflowRecordSimpleRelationFields(
    recordWithMorphRelations,
    objectMetadataInfo,
  );

  return { formattedRecord, joinColumnNamesByMorphFieldName };
};
