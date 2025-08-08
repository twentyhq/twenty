import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnAlter,
  type WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

export type BasicFieldMetadataType =
  | FieldMetadataType.UUID
  | FieldMetadataType.TEXT
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.NUMBER
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.POSITION
  | FieldMetadataType.DATE_TIME
  | FieldMetadataType.DATE
  | FieldMetadataType.POSITION
  | FieldMetadataType.ARRAY;

@Injectable()
export class BasicColumnActionFactory extends ColumnActionAbstractFactory<BasicFieldMetadataType> {
  protected readonly logger = new Logger(BasicColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataEntity<BasicFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    const columnName = computeColumnName(fieldMetadata);
    const defaultValue = fieldMetadata.defaultValue ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);

    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName,
        columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isArray: fieldMetadata.type === FieldMetadataType.ARRAY,
        isNullable: fieldMetadata.isNullable ?? true,
        isUnique: fieldMetadata.isUnique ?? false,
        defaultValue: serializedDefaultValue,
      },
    ];
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataEntity<BasicFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataEntity<BasicFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    const currentColumnName = computeColumnName(currentFieldMetadata);
    const alteredColumnName = computeColumnName(alteredFieldMetadata);
    const defaultValue =
      alteredFieldMetadata.defaultValue ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);

    if (!currentColumnName || !alteredColumnName) {
      this.logger.error(
        `Column name not found for current or altered field metadata, can be due to a missing or an invalid target column map. Current column name: ${currentColumnName}, Altered column name: ${alteredColumnName}.`,
      );
      throw new WorkspaceMigrationException(
        `Column name not found for current or altered field metadata`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    return [
      {
        action: WorkspaceMigrationColumnActionType.ALTER,
        currentColumnDefinition: {
          columnName: currentColumnName,
          columnType: fieldMetadataTypeToColumnType(currentFieldMetadata.type),
          isArray: currentFieldMetadata.type === FieldMetadataType.ARRAY,
          isNullable: currentFieldMetadata.isNullable ?? true,
          isUnique: currentFieldMetadata.isUnique ?? false,
          defaultValue: serializeDefaultValue(
            currentFieldMetadata.defaultValue,
          ),
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
          isArray: alteredFieldMetadata.type === FieldMetadataType.ARRAY,
          isNullable: alteredFieldMetadata.isNullable ?? true,
          isUnique: alteredFieldMetadata.isUnique ?? false,
          defaultValue: serializedDefaultValue,
        },
      },
    ];
  }
}
