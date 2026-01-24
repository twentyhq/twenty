import { FieldMetadataType } from 'twenty-shared/types';

import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { isTextColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-text-column-type.util';

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
    case FieldMetadataType.FILES:
    case FieldMetadataType.RAW_JSON:
      return 'jsonb';
    case FieldMetadataType.TS_VECTOR:
      return 'tsvector';
    default:
      throw new WorkspaceMigrationActionExecutionException({
        message: `Cannot convert ${fieldMetadataType} to column type.`,
        code: WorkspaceMigrationActionExecutionExceptionCode.UNSUPPORTED_FIELD_METADATA_TYPE,
      });
  }
};
