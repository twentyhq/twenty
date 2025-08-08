import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnAlter,
  type WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

@Injectable()
export class RelationColumnActionFactory extends ColumnActionAbstractFactory<FieldMetadataType.RELATION> {
  protected readonly logger = new Logger(RelationColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    if (!fieldMetadata.settings || !fieldMetadata.settings.joinColumnName) {
      return [];
    }

    const joinColumnName = fieldMetadata.settings.joinColumnName;

    return [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: joinColumnName,
        columnType: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
        isArray: false,
        isNullable: fieldMetadata.isNullable ?? true,
        isUnique: false,
        defaultValue: null,
      },
    ];
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
    alteredFieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    if (!currentFieldMetadata.settings || !alteredFieldMetadata.settings) {
      return [];
    }

    if (
      currentFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY
    ) {
      return [];
    }

    const currentJoinColumnName = currentFieldMetadata.settings.joinColumnName;
    const alteredJoinColumnName = alteredFieldMetadata.settings.joinColumnName;

    if (!currentJoinColumnName || !alteredJoinColumnName) {
      this.logger.error(
        `Column name not found for current or altered field metadata, can be due to a missing or an invalid target column map. Current column name: ${currentJoinColumnName}, Altered column name: ${alteredJoinColumnName}.`,
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
          columnName: currentJoinColumnName,
          columnType: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
          isArray: false,
          isNullable: currentFieldMetadata.isNullable ?? true,
          isUnique: false,
          defaultValue: null,
        },
        alteredColumnDefinition: {
          columnName: alteredJoinColumnName,
          columnType: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
          isArray: false,
          isNullable: alteredFieldMetadata.isNullable ?? true,
          isUnique: false,
          defaultValue: null,
        },
      },
    ];
  }
}
