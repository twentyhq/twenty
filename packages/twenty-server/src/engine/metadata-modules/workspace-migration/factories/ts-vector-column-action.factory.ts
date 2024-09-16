import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { computeColumnName, computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { BasicFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
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

    const object = fieldMetadata.objectMetadataId

    let columnNames: string[] = [];
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeType = compositeTypeDefinitions.get(fieldMetadata.type) as CompositeType;
        for (const property of compositeType.properties) {
            if (property.type === FieldMetadataType.RELATION) {
              throw new WorkspaceMigrationException(
                `Relation type not supported for composite columns`,
                WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE,
              );
            }

            columnNames.push(computeCompositeColumnName(fieldMetadata, property));
    }
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
        generatedType: fieldMetadata.generatedType,
        asExpression: fieldMetadata.asExpression,
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
