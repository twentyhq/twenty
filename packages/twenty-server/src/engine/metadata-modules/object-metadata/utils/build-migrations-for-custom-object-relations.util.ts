import { RelationOnDeleteAction } from 'twenty-shared/types';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnCreate,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildMigrationsForCustomObjectRelations = (
  createdObjectMetadata: Pick<
    ObjectMetadataItemWithFieldMaps,
    'nameSingular' | 'isCustom'
  >,
  relatedObjectMetadataCollection: Pick<
    ObjectMetadataItemWithFieldMaps,
    'nameSingular' | 'isCustom'
  >[],
): WorkspaceMigrationTableAction[] => {
  const migrations: WorkspaceMigrationTableAction[] = [];

  for (const relatedObjectMetadata of relatedObjectMetadataCollection) {
    migrations.push(
      {
        name: computeObjectTargetTable(relatedObjectMetadata),
        action: WorkspaceMigrationTableActionType.ALTER,
        columns: [
          {
            action: WorkspaceMigrationColumnActionType.CREATE,
            // TODO: When we get rid of this and use the sync metadata, columnName must be based on the joinColumnName from the field metadata settings
            columnName: computeColumnName(createdObjectMetadata.nameSingular, {
              isForeignKey: true,
            }),
            columnType: 'uuid',
            isNullable: true,
            defaultValue: null,
          } satisfies WorkspaceMigrationColumnCreate,
        ],
      },
      {
        name: computeObjectTargetTable(relatedObjectMetadata),
        action: WorkspaceMigrationTableActionType.ALTER,
        columns: [
          {
            action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
            // TODO: When we get rid of this and use the sync metadata, columnName must be based on the joinColumnName from the field metadata settings
            columnName: computeColumnName(createdObjectMetadata.nameSingular, {
              isForeignKey: true,
            }),
            referencedTableName: computeObjectTargetTable(
              createdObjectMetadata,
            ),
            referencedTableColumnName: 'id',
            onDelete: RelationOnDeleteAction.CASCADE,
          },
        ],
      },
    );
  }

  return migrations;
};
