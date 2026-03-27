import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const LARGE_STRUCTURE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RICH_TEXT,
]);

const SNAPSHOT_STRUCTURE_MAX_DEPTH = 2;

type CloneStructureToDepthArgs = {
  value: unknown;
  maxDepth: number;
  currentDepth?: number;
};

export type CopyFormattedFieldValueArgs = {
  value: unknown;
  fieldType: FieldMetadataType;
};

function cloneStructureToDepth({
  value,
  maxDepth,
  currentDepth = 0,
}: CloneStructureToDepthArgs): unknown {
  if (currentDepth >= maxDepth) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      cloneStructureToDepth({
        value: item,
        maxDepth,
        currentDepth: currentDepth + 1,
      }),
    );
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        cloneStructureToDepth({
          value: entryValue,
          maxDepth,
          currentDepth: currentDepth + 1,
        }),
      ]),
    );
  }

  return value;
}

export const copyFormattedFieldValue = ({
  value,
  fieldType,
}: CopyFormattedFieldValueArgs): unknown => {
  if (!isDefined(value)) {
    return value;
  }

  if (!isPlainObject(value) && !Array.isArray(value)) {
    return value;
  }

  if (LARGE_STRUCTURE_FIELD_TYPES.has(fieldType)) {
    return cloneStructureToDepth({
      value,
      maxDepth: SNAPSHOT_STRUCTURE_MAX_DEPTH,
    });
  }

  return structuredClone(value);
};
