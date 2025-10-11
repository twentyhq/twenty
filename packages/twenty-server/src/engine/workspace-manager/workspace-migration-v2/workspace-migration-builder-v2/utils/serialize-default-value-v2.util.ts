import { type ColumnType } from 'typeorm';

import { type FieldMetadataDefaultSerializableValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/is-function-default-value.util';
import { serializeFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-function-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

type SerializeDefaultValueV2Args = {
  defaultValue?: FieldMetadataDefaultSerializableValue;
  columnType?: ColumnType;
  schemaName: string;
  tableName: string;
  columnName: string;
};
export const serializeDefaultValueV2 = ({
  columnType,
  defaultValue,
  schemaName,
  tableName,
  columnName,
}: SerializeDefaultValueV2Args) => {
  const safeSchemaName = removeSqlDDLInjection(schemaName);
  const safeTableName = removeSqlDDLInjection(tableName);
  const safeColumnName = removeSqlDDLInjection(columnName);

  if (defaultValue === undefined || defaultValue === null) {
    return 'NULL';
  }

  // Function default values
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

  const castSuffix =
    columnType === 'enum'
      ? `::${safeSchemaName}."${safeTableName}_${safeColumnName}_enum"`
      : `::${columnType}`;

  const sanitizeAndAddCastPrefix = (defaultValue: string) =>
    `'${removeSqlDDLInjection(defaultValue)}'` + castSuffix;

  switch (typeof defaultValue) {
    case 'string': {
      if (!defaultValue.startsWith("'") || !defaultValue.endsWith("'")) {
        throw new FieldMetadataException(
          `Invalid string default value "${defaultValue}" should be single quoted`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      return sanitizeAndAddCastPrefix(defaultValue);
    }
    case 'boolean':
    case 'number': {
      return sanitizeAndAddCastPrefix(`${defaultValue}`);
    }
    case 'object': {
      if (defaultValue instanceof Date) {
        return sanitizeAndAddCastPrefix(`'${defaultValue.toISOString()}'`);
      }

      if (Array.isArray(defaultValue)) {
        const arrayValues = defaultValue
          .map((val) => `'${removeSqlDDLInjection(val)}'`)
          .join(',');

        return `ARRAY[${arrayValues}]${castSuffix}[]`;
      }

      // Default value for objects won't work with sanitization here
      return sanitizeAndAddCastPrefix(`'${JSON.stringify(defaultValue)}'`);
    }
    default: {
      throw new FieldMetadataException(
        `Invalid default value "${defaultValue}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
};
