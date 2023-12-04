/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/metadata/workspace-migration/interfaces/workspace-column-action-options.interface';
import { WorkspaceColumnActionFactory } from 'src/metadata/workspace-migration/interfaces/workspace-column-action-factory.interface';

import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnAlter,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export class ColumnActionAbstractFactory<
  T extends FieldMetadataType | 'default',
> implements WorkspaceColumnActionFactory<T>
{
  protected readonly logger = new Logger(ColumnActionAbstractFactory.name);

  create(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    previousFieldMetadata: FieldMetadataInterface<T> | undefined,
    nextFieldMetadata: FieldMetadataInterface<T>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction {
    switch (action) {
      case WorkspaceMigrationColumnActionType.CREATE:
        return this.handleCreateAction(nextFieldMetadata, options);
      case WorkspaceMigrationColumnActionType.ALTER: {
        if (!previousFieldMetadata) {
          throw new Error('Previous field metadata is required for alter');
        }

        return this.handleAlterAction(
          previousFieldMetadata,
          nextFieldMetadata,
          options,
        );
      }
      default: {
        this.logger.error(`Invalid action: ${action}`);

        throw new Error('[AbstractFactory]: invalid action');
      }
    }
  }

  protected handleCreateAction(
    _fieldMetadata: FieldMetadataInterface<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate {
    throw new Error('handleCreateAction method not implemented.');
  }

  protected handleAlterAction(
    _previousFieldMetadata: FieldMetadataInterface<T>,
    _nextFieldMetadata: FieldMetadataInterface<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter {
    throw new Error('handleAlterAction method not implemented.');
  }
}
