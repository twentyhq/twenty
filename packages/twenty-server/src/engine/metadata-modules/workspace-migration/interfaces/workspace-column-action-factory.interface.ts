import { type FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  type WorkspaceMigrationColumnAction,
  type WorkspaceMigrationColumnActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

export interface WorkspaceColumnActionFactory<T extends FieldMetadataType> {
  create(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataEntity<T> | undefined,
    alteredFieldMetadata: FieldMetadataEntity<T>,
    options?: WorkspaceColumnActionOptions,
  ): WorkspaceMigrationColumnAction[];
}
