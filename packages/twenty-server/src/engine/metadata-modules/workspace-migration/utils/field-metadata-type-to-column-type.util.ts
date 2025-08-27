import { FieldMetadataType } from 'twenty-shared/types';

import { isTextColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/is-text-column-type.util';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

export const fieldMetadataTypeToColumnType = <Type extends FieldMetadataType>(
  fieldMetadataType: Type,
  // Should be columnType
): string => {
  /**
   * Composite types are not implemented here, as they are flattened by their composite definitions.
   * See src/metadata/field-metadata/composite-types for more information.
   */
  if (isTextColumnType(fieldMetadataType)) {
    return 'text';
  }
  switch (fieldMetadataType) {
    case FieldMetadataType.UUID:
      return 'uuid';
    case FieldMetadataType.NUMERIC:
      return 'numeric';
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.POSITION:
      return 'float';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.DATE_TIME:
      return 'timestamptz';
    case FieldMetadataType.DATE:
      return 'date';
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return 'enum';
    case FieldMetadataType.RAW_JSON:
      return 'jsonb';
    case FieldMetadataType.TS_VECTOR:
      return 'tsvector';
    default:
      throw new WorkspaceMigrationException(
        `Cannot convert ${fieldMetadataType} to column type.`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
  }
};
