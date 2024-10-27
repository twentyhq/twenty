import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildMigrationsForCustomObjectRelations = (
  createdObjectMetadata: ObjectMetadataEntity,
  relatedObjectMetadataCollection: ObjectMetadataEntity[],
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
