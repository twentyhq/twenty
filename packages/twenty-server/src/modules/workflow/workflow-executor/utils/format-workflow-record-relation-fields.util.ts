import { isObject, isString } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

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

export const formatWorkflowRecordRelationFields = (
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
