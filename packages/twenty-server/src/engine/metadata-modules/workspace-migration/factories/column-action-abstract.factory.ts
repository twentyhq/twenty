import { Logger } from '@nestjs/common';

import { type FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-factory.interface';
import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  type WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnAlter,
  type WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

export class ColumnActionAbstractFactory<T extends FieldMetadataType>
  implements WorkspaceColumnActionFactory<T>
{
  protected readonly logger = new Logger(ColumnActionAbstractFactory.name);

  create(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataEntity<T> | undefined,
    alteredFieldMetadata: FieldMetadataEntity<T>,
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
    _fieldMetadata: FieldMetadataEntity<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    throw new WorkspaceMigrationException(
      'handleCreateAction method not implemented.',
      WorkspaceMigrationExceptionCode.INVALID_ACTION,
    );
  }

  protected handleAlterAction(
    _currentFieldMetadata: FieldMetadataEntity<T>,
    _alteredFieldMetadata: FieldMetadataEntity<T>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    throw new WorkspaceMigrationException(
      'handleAlterAction method not implemented.',
      WorkspaceMigrationExceptionCode.INVALID_ACTION,
    );
  }
}
