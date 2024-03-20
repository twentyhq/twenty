import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';

export type BasicFieldMetadataType =
  | FieldMetadataType.UUID
  | FieldMetadataType.TEXT
  | FieldMetadataType.PHONE
  | FieldMetadataType.EMAIL
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.NUMBER
  | FieldMetadataType.PROBABILITY
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.POSITION
  | FieldMetadataType.DATE_TIME
  | FieldMetadataType.POSITION;

@Injectable()
export class BasicColumnActionFactory extends ColumnActionAbstractFactory<BasicFieldMetadataType> {
  protected readonly logger = new Logger(BasicColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate {
    const defaultValue =
      fieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);

    return {
      action: WorkspaceMigrationColumnActionType.CREATE,
      columnName: fieldMetadata.targetColumnMap.value,
      columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
      isNullable: fieldMetadata.isNullable,
      defaultValue: serializedDefaultValue,
    };
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter {
    const defaultValue =
      alteredFieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);
    const currentColumnName = currentFieldMetadata.targetColumnMap.value;
    const alteredColumnName = alteredFieldMetadata.targetColumnMap.value;

    if (!currentColumnName || !alteredColumnName) {
      this.logger.error(
        `Column name not found for current or altered field metadata, can be due to a missing or an invalid target column map. Current column name: ${currentColumnName}, Altered column name: ${alteredColumnName}.`,
      );
      throw new Error(
        `Column name not found for current or altered field metadata`,
      );
    }

    return {
      action: WorkspaceMigrationColumnActionType.ALTER,
      currentColumnDefinition: {
        columnName: currentColumnName,
        columnType: fieldMetadataTypeToColumnType(currentFieldMetadata.type),
        isNullable: currentFieldMetadata.isNullable,
        defaultValue: serializeDefaultValue(
          currentFieldMetadata.defaultValue?.value,
        ),
      },
      alteredColumnDefinition: {
        columnName: alteredColumnName,
        columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
        isNullable: alteredFieldMetadata.isNullable,
        defaultValue: serializedDefaultValue,
      },
    };
  }
}
