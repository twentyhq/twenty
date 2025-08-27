import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnAction,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

export type VirtualFieldMetadataType = FieldMetadataType.HAS_MANY_THROUGH;

@Injectable()
export class VirtualColumnActionFactory extends ColumnActionAbstractFactory<VirtualFieldMetadataType> {
  protected handleCreateAction(
    _action: WorkspaceMigrationColumnActionType.CREATE,
    _fieldMetadata: FieldMetadataEntity<VirtualFieldMetadataType>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction[] {
    // Virtual fields don't create database columns
    return [];
  }

  protected handleAlterAction(
    _action: WorkspaceMigrationColumnActionType.ALTER,
    _currentFieldMetadata: FieldMetadataEntity<VirtualFieldMetadataType>,
    _alteredFieldMetadata: FieldMetadataEntity<VirtualFieldMetadataType>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction[] {
    // Virtual fields don't alter database columns
    return [];
  }

  protected handleDeleteAction(
    _action: WorkspaceMigrationColumnActionType.DROP,
    _fieldMetadata: FieldMetadataEntity<VirtualFieldMetadataType>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction[] {
    // Virtual fields don't drop database columns
    return [];
  }
}