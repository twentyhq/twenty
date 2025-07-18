import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

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

@Injectable()
export class MorphRelationColumnActionFactory extends ColumnActionAbstractFactory<FieldMetadataType.MORPH_RELATION> {
  protected readonly logger = new Logger(MorphRelationColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
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
    currentFieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
    alteredFieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
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
