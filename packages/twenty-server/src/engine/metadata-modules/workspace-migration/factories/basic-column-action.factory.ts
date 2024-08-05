import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

export type BasicFieldMetadataType =
  | FieldMetadataType.UUID
  | FieldMetadataType.TEXT
  | FieldMetadataType.PHONE
  | FieldMetadataType.EMAIL
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.NUMBER
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.POSITION
  | FieldMetadataType.DATE_TIME
  | FieldMetadataType.DATE
  | FieldMetadataType.POSITION;

@Injectable()
export class BasicColumnActionFactory extends ColumnActionAbstractFactory<BasicFieldMetadataType> {
  protected readonly logger = new Logger(BasicColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
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
        isNullable: fieldMetadata.isNullable ?? true,
        defaultValue: serializedDefaultValue,
      },
    ];
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
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
          isNullable: currentFieldMetadata.isNullable ?? true,
          defaultValue: serializeDefaultValue(
            currentFieldMetadata.defaultValue,
          ),
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
          isNullable: alteredFieldMetadata.isNullable ?? true,
          defaultValue: serializedDefaultValue,
        },
      },
    ];
  }
}
