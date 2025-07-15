import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import {
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

@Injectable()
export class MorphRelationColumnActionFactory extends ColumnActionAbstractFactory<FieldMetadataType.MORPH_RELATION> {
  protected readonly logger = new Logger(MorphRelationColumnActionFactory.name);

  protected handleCreateAction(
    _fieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnCreate[] {
    return [];
  }

  protected handleAlterAction(
    _currentFieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
    _alteredFieldMetadata: FieldMetadataInterface<FieldMetadataType.MORPH_RELATION>,
    _options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAlter[] {
    return [];
  }
}
