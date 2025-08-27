import { type FieldMetadataDefaultSerializableValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/is-function-default-value.util';
import { serializeFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-function-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';
import { ColumnType } from 'typeorm';

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

  const sanitizeAndAddPrefix = (defaultValue: string) =>
    `'${removeSqlDDLInjection(defaultValue)}'` + castPrefix;

  const castPrefix =
    columnType === 'enum'
      ? `::${safeSchemaName}."${safeTableName}_${safeColumnName}_enum"`
      : `::${columnType}`;

  switch (typeof defaultValue) {
    case 'string': {
      if (!defaultValue.startsWith("'") || !defaultValue.endsWith("'")) {
        throw new FieldMetadataException(
          `Invalid string default value "${defaultValue}" should be single quoted`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      return sanitizeAndAddPrefix(defaultValue);
    }
    case 'boolean':
    case 'number': {
      return sanitizeAndAddPrefix(`${defaultValue}`);
    }
    case 'object': {
      if (defaultValue instanceof Date) {
        return sanitizeAndAddPrefix(`'${defaultValue.toISOString()}'`);
      }

      if (Array.isArray(defaultValue)) {
        const arrayValues = defaultValue
          .map((val) => sanitizeAndAddPrefix(val))
          .join(',');

        return `ARRAY[${arrayValues}]`;
      }

      return sanitizeAndAddPrefix(`'${JSON.stringify(defaultValue)}'`); // Won't work :thinking: at all will remove every brackets and so on
    }
    default: {
      throw new FieldMetadataException(
        `Invalid default value "${defaultValue}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
};
