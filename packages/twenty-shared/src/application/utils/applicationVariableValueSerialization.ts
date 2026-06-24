import {
  type ApplicationVariableType,
  type ApplicationVariableValue,
} from '@/application/applicationVariablesType';
import { FieldMetadataType } from '@/types/FieldMetadataType';

// Application/server variable values are always persisted as encrypted
// strings. These helpers convert a typed value to/from its string
// representation so the settings UI can render the proper input while the
// storage layer stays type-agnostic.

export const serializeApplicationVariableValue = (
  value: ApplicationVariableValue | undefined,
  type: ApplicationVariableType = FieldMetadataType.TEXT,
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case FieldMetadataType.BOOLEAN:
      return String(value) === 'true' ? 'true' : 'false';
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return String(value);
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return typeof value === 'string' ? value : JSON.stringify(value);
    case FieldMetadataType.RAW_JSON:
      return typeof value === 'string' ? value : JSON.stringify(value);
    default:
      // TEXT, RICH_TEXT, SELECT, DATE, DATE_TIME
      return typeof value === 'string' ? value : String(value);
  }
};

export const deserializeApplicationVariableValue = (
  value: string,
  type: ApplicationVariableType = FieldMetadataType.TEXT,
): ApplicationVariableValue => {
  if (value === '') {
    return type === FieldMetadataType.ARRAY ||
      type === FieldMetadataType.MULTI_SELECT
      ? []
      : '';
  }

  switch (type) {
    case FieldMetadataType.BOOLEAN:
      return value === 'true';
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC: {
      const parsed = Number(value);

      return Number.isNaN(parsed) ? value : parsed;
    }
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      try {
        const parsed = JSON.parse(value) as unknown;

        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    case FieldMetadataType.RAW_JSON:
      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        return value;
      }
    default:
      return value;
  }
};
