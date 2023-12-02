import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceColumnActionOptions } from 'src/metadata/workspace-migration/interfaces/workspace-column-action-options.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { serializeDefaultValue } from 'src/metadata/field-metadata/utils/serialize-default-value';
import { fieldMetadataTypeToColumnType } from 'src/metadata/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { ColumnActionAbstractFactory } from 'src/metadata/workspace-migration/factories/column-action-abstract.factory';

export type BasicFieldMetadataType =
  | FieldMetadataType.UUID
  | FieldMetadataType.TEXT
  | FieldMetadataType.PHONE
  | FieldMetadataType.EMAIL
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.NUMBER
  | FieldMetadataType.PROBABILITY
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.DATE_TIME;

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
    previousFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    nextFieldMetadata: FieldMetadataInterface<BasicFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter {
    const defaultValue =
      nextFieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);

    return {
      action: WorkspaceMigrationColumnActionType.ALTER,
      columnName: nextFieldMetadata.targetColumnMap.value,
      columnType: fieldMetadataTypeToColumnType(nextFieldMetadata.type),
      isNullable: nextFieldMetadata.isNullable,
      defaultValue: serializedDefaultValue,
    };
  }
}
