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

export type EnumFieldMetadataType =
  | FieldMetadataType.RATING
  | FieldMetadataType.SELECT
  | FieldMetadataType.MULTI_SELECT;

@Injectable()
export class EnumColumnActionFactory extends ColumnActionAbstractFactory<EnumFieldMetadataType> {
  protected readonly logger = new Logger(EnumColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    options: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate {
    const defaultValue =
      fieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);
    const enumOptions = fieldMetadata.options
      ? [...fieldMetadata.options.map((option) => option.value)]
      : undefined;

    return {
      action: WorkspaceMigrationColumnActionType.CREATE,
      columnName: fieldMetadata.targetColumnMap.value,
      columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
      enum: enumOptions,
      isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
      isNullable: fieldMetadata.isNullable,
      defaultValue: serializedDefaultValue,
    };
  }

  protected handleAlterAction(
    previousFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    nextFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    options: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter {
    const defaultValue =
      nextFieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);
    const enumOptions = nextFieldMetadata.options
      ? [
          ...nextFieldMetadata.options.map((option) => {
            const previousOption = previousFieldMetadata.options?.find(
              (previousOption) => previousOption.id === option.id,
            );

            // The id is the same, but the value is different, so we need to alter the enum
            if (previousOption && previousOption.value !== option.value) {
              return {
                from: previousOption.value,
                to: option.value,
              };
            }

            return option.value;
          }),
        ]
      : undefined;

    return {
      action: WorkspaceMigrationColumnActionType.ALTER,
      columnName: nextFieldMetadata.targetColumnMap.value,
      columnType: fieldMetadataTypeToColumnType(nextFieldMetadata.type),
      enum: enumOptions,
      isArray: nextFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
      isNullable: nextFieldMetadata.isNullable,
      defaultValue: serializedDefaultValue,
    };
  }
}
