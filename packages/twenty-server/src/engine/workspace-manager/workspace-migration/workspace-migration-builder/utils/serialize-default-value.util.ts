import { type ColumnType } from 'typeorm';
import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/is-function-default-value.util';
import { serializeFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-function-default-value.util';
import {
  escapeIdentifier,
  escapeLiteral,
  removeSqlDDLInjection,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type SerializeDefaultValueArgs = {
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  columnType?: ColumnType;
  schemaName: string;
  tableName: string;
  columnName: string;
};
export const serializeDefaultValue = ({
  columnType,
  defaultValue,
  schemaName,
  tableName,
  columnName,
}: SerializeDefaultValueArgs) => {
  if (defaultValue === undefined || defaultValue === null) {
    return 'NULL';
  }

  if (isFunctionDefaultValue(defaultValue)) {
    const serializedTypeDefaultValue =
      serializeFunctionDefaultValue(defaultValue);

    if (!serializedTypeDefaultValue) {
      throw new FieldMetadataException(
        'Invalid default value',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    return serializedTypeDefaultValue;
  }

  // Enum types need a schema-qualified cast; others use the column type directly.
  // Enum name is built from sanitized table+column (removeSqlDDLInjection strips
  // to [a-zA-Z0-9_]) to match computePostgresEnumName.
  const castSuffix =
    columnType === 'enum'
      ? `::${escapeIdentifier(schemaName)}.${escapeIdentifier(`${removeSqlDDLInjection(tableName)}_${removeSqlDDLInjection(columnName)}_enum`)}`
      : `::${columnType}`;

  const escapeAndCast = (rawValue: string) =>
    escapeLiteral(rawValue) + castSuffix;

  switch (typeof defaultValue) {
    case 'string': {
      if (!defaultValue.startsWith("'") || !defaultValue.endsWith("'")) {
        throw new FieldMetadataException(
          `Invalid string default value "${defaultValue}" should be single quoted`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      // Strip the surrounding single quotes then properly escape the inner value
      const innerValue = defaultValue.slice(1, -1);

      return escapeAndCast(innerValue);
    }
    case 'boolean':
    case 'number': {
      return escapeAndCast(`${defaultValue}`);
    }
    case 'object': {
      if (defaultValue instanceof Date) {
        return escapeAndCast(defaultValue.toISOString());
      }

      if (Array.isArray(defaultValue)) {
        const arrayValues = defaultValue
          .map((val) => escapeLiteral(String(val)))
          .join(',');

        return `ARRAY[${arrayValues}]${castSuffix}[]`;
      }

      return escapeAndCast(JSON.stringify(defaultValue));
    }
    default: {
      throw new FieldMetadataException(
        `Invalid default value "${defaultValue}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
};
