import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

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
  ): WorkspaceMigrationColumnCreate[] {
    const columnName = computeColumnName(fieldMetadata);
    const defaultValue = fieldMetadata.defaultValue ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);
    const enumOptions = fieldMetadata.options
      ? [...fieldMetadata.options.map((option) => option.value)]
      : undefined;

    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName,
        columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
        enum: enumOptions,
        isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
        isNullable: fieldMetadata.isNullable ?? true,
        isUnique: fieldMetadata.isUnique ?? false,
        defaultValue: serializedDefaultValue,
      },
    ];
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<EnumFieldMetadataType>,
    options: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    const currentColumnName = computeColumnName(currentFieldMetadata);
    const alteredColumnName = computeColumnName(alteredFieldMetadata);
    const defaultValue =
      alteredFieldMetadata.defaultValue ?? options?.defaultValue;
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
          enum: currentFieldMetadata.options
            ? [...currentFieldMetadata.options.map((option) => option.value)]
            : undefined,
          isArray: currentFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          isNullable: currentFieldMetadata.isNullable ?? true,
          isUnique: currentFieldMetadata.isUnique ?? false,
          defaultValue: serializeDefaultValue(
            currentFieldMetadata.defaultValue,
          ),
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
          enum: enumOptions,
          isArray: alteredFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          isNullable: alteredFieldMetadata.isNullable ?? true,
          isUnique: alteredFieldMetadata.isUnique ?? false,
          defaultValue: serializedDefaultValue,
        },
      },
    ];
  }
}
