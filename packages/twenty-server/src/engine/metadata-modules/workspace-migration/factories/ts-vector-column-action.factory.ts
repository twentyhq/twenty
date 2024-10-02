import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
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

  handleCreateAction(
    fieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
  ): WorkspaceMigrationColumnCreate[] {
    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(fieldMetadata),
        columnType: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isNullable: fieldMetadata.isNullable ?? true,
        defaultValue: undefined,
        generatedType: fieldMetadata.generatedType,
        asExpression: fieldMetadata.asExpression,
      },
    ];
  }

  protected handleAlterAction(
    _currentFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    _alteredFieldMetadata: FieldMetadataInterface<TsVectorFieldMetadataType>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    throw new WorkspaceMigrationException(
      `TsVectorColumnActionFactory.handleAlterAction has not been implemented yet.`,
      WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
    );
  }
}
