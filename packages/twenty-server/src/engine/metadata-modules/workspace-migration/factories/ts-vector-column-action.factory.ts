import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

export type TsVectorFieldMetadataType = FieldMetadataType.TS_VECTOR;

@Injectable()
export class TsVectorColumnActionFactory extends ColumnActionAbstractFactory<TsVectorFieldMetadataType> {
  protected readonly logger = new Logger(TsVectorColumnActionFactory.name);

  handleCreateAction(
    fieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
  ): WorkspaceMigrationColumnCreate[] {
    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(fieldMetadata),
        columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isNullable: fieldMetadata.isNullable ?? true,
        isUnique: fieldMetadata.isUnique ?? false,
        defaultValue: undefined,
        generatedType: fieldMetadata.generatedType,
        asExpression: fieldMetadata.asExpression,
      },
    ];
  }

  handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
  ): WorkspaceMigrationColumnAlter[] {
    return [
      {
        action: WorkspaceMigrationColumnActionType.ALTER,
        currentColumnDefinition: {
          columnName: currentFieldMetadata.name,
          columnType: fieldMetadataTypeToColumnType(currentFieldMetadata.type),
          isNullable: currentFieldMetadata.isNullable ?? true,
          defaultValue: undefined,
        },
        alteredColumnDefinition: {
          columnName: alteredFieldMetadata.name,
          columnType: fieldMetadataTypeToColumnType(alteredFieldMetadata.type),
          isNullable: alteredFieldMetadata.isNullable ?? true,
          defaultValue: undefined,
          asExpression: alteredFieldMetadata.asExpression,
          generatedType: alteredFieldMetadata.generatedType,
        },
      },
    ];
  }
}
