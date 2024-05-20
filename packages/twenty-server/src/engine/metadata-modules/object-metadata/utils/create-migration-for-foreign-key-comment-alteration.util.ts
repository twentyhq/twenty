import { DataSource } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationTableActionType,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationCreateComment,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export const buildAlteredCommentOnForeignKeyDeletion = async (
  localObjectMetadataName: string,
  remoteObjectMetadataName: string,
  schema: string,
  workspaceDataSource: DataSource | undefined,
): Promise<string | null> => {
  const existingComment = await workspaceDataSource?.query(
    `SELECT col_description('${schema}."${localObjectMetadataName}"'::regclass, 0)`,
  );

  if (!existingComment[0]?.col_description) {
    return null;
  }

  const commentWithoutGraphQL = existingComment[0].col_description
    .replace('@graphql(', '')
    .replace(')', '');

  const parsedComment = JSON.parse(commentWithoutGraphQL);

  const currentForeignKeys = parsedComment.foreign_keys;

  if (!currentForeignKeys) {
    return null;
  }

  const updatedForeignKeys = currentForeignKeys.filter(
    (foreignKey: any) =>
      foreignKey.foreign_name !== remoteObjectMetadataName &&
      foreignKey.foreign_table !== remoteObjectMetadataName,
  );

  parsedComment.foreign_keys = updatedForeignKeys;

  return `@graphql(${JSON.stringify(parsedComment)})`;
};

export const createMigrationToAlterCommentOnForeignKeyDeletion = async (
  dataSourceService: DataSourceService,
  typeORMService: TypeORMService,
  workspaceMigrationService: WorkspaceMigrationService,
  workspaceId: string,
  relationToDelete: RelationToDelete,
) => {
  const dataSourceMetadata =
    await dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
      workspaceId,
    );

  const workspaceDataSource =
    await typeORMService.connectToDataSource(dataSourceMetadata);

  const alteredComment = await buildAlteredCommentOnForeignKeyDeletion(
    relationToDelete.toObjectName,
    relationToDelete.fromObjectName,
    dataSourceMetadata.schema,
    workspaceDataSource,
  );

  if (alteredComment) {
    await workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `alter-comment-${relationToDelete.fromObjectName}-${relationToDelete.toObjectName}`,
      ),
      workspaceId,
      [
        {
          name: computeTableName(
            relationToDelete.toObjectName,
            relationToDelete.toObjectMetadataIsCustom,
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
              comment: alteredComment,
            } satisfies WorkspaceMigrationCreateComment,
          ],
        },
      ],
    );
  }
};
