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

export type TsVectorFieldMetadataType = FieldMetadataType.TS_VECTOR;

@Injectable()
export class TsVectorColumnActionFactory extends ColumnActionAbstractFactory<TsVectorFieldMetadataType> {
  protected readonly logger = new Logger(TsVectorColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    const defaultValue = fieldMetadata.defaultValue ?? options?.defaultValue;
    const serializedDefaultValue = serializeDefaultValue(defaultValue);

    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(fieldMetadata),
        columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isNullable: fieldMetadata.isNullable ?? true,
        defaultValue: serializedDefaultValue,
        generatedType: fieldMetadata.generatedType,
        asExpression: fieldMetadata.asExpression,
      },
    ];
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    // TO DO implement
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
          generatedType: currentFieldMetadata.generatedType,
          asExpression: currentFieldMetadata.asExpression,
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
          isNullable: alteredFieldMetadata.isNullable ?? true,
          defaultValue: serializedDefaultValue,
          generatedType: alteredFieldMetadata.generatedType,
          asExpression: alteredFieldMetadata.asExpression,
        },
      },
    ];
  }
}
