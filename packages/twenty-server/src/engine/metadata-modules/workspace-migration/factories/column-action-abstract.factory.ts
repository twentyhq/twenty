/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-factory.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import {
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

export class ColumnActionAbstractFactory<
  T extends FieldMetadataType | 'default',
> implements WorkspaceColumnActionFactory<T>
{
  protected readonly logger = new Logger(ColumnActionAbstractFactory.name);

  create(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataInterface<T> | undefined,
    alteredFieldMetadata: FieldMetadataInterface<T>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction[] {
    switch (action) {
      case WorkspaceMigrationColumnActionType.CREATE:
        return this.handleCreateAction(alteredFieldMetadata, options);
      case WorkspaceMigrationColumnActionType.ALTER: {
        if (!currentFieldMetadata) {
          throw new WorkspaceMigrationException(
            'current field metadata is required for alter',
            WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
          );
        }

        return this.handleAlterAction(
          currentFieldMetadata,
          alteredFieldMetadata,
          options,
        );
      }
      default: {
        this.logger.error(`Invalid action: ${action}`);
        throw new WorkspaceMigrationException(
          '[AbstractFactory]: invalid action',
          WorkspaceMigrationExceptionCode.INVALID_ACTION,
        );
      }
    }
  }

  protected handleCreateAction(
    _fieldMetadata: FieldMetadataInterface<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    throw new WorkspaceMigrationException(
      'handleCreateAction method not implemented.',
      WorkspaceMigrationExceptionCode.INVALID_ACTION,
    );
  }

  protected handleAlterAction(
    _currentFieldMetadata: FieldMetadataInterface<T>,
    _alteredFieldMetadata: FieldMetadataInterface<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    throw new WorkspaceMigrationException(
      'handleAlterAction method not implemented.',
      WorkspaceMigrationExceptionCode.INVALID_ACTION,
    );
  }
}
