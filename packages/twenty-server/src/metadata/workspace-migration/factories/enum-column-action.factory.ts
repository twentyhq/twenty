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
    currentFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    options: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter {
    const defaultValue =
      alteredFieldMetadata.defaultValue?.value ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);
    const enumOptions = alteredFieldMetadata.options
      ? [
          ...alteredFieldMetadata.options.map((option) => {
            const currentOption = currentFieldMetadata.options?.find(
              (currentOption) => currentOption.id === option.id,
            );

            // The id is the same, but the value is different, so we need to alter the enum
            if (currentOption && currentOption.value !== option.value) {
              return {
                from: currentOption.value,
                to: option.value,
              };
            }

            return option.value;
          }),
        ]
      : undefined;

    return {
      action: WorkspaceMigrationColumnActionType.ALTER,
      currentColumnDefinition: {
        columnName: currentFieldMetadata.targetColumnMap.value,
        columnType: fieldMetadataTypeToColumnType(currentFieldMetadata.type),
        enum: currentFieldMetadata.options
          ? [...currentFieldMetadata.options.map((option) => option.value)]
          : undefined,
        isArray: currentFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
        isNullable: currentFieldMetadata.isNullable,
        defaultValue: serializeDefaultValue(
          currentFieldMetadata.defaultValue?.value,
        ),
      },
      alteredColumnDefinition: {
        columnName: alteredFieldMetadata.targetColumnMap.value,
        columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
        enum: enumOptions,
        isArray: alteredFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
        isNullable: alteredFieldMetadata.isNullable,
        defaultValue: serializedDefaultValue,
      },
    };
  }
}
