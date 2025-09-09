import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_index',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      );

    const { flatIndexMetadata } = action;

    await fieldMetadataRepository.save(flatIndexMetadata);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    const {
      action: { flatIndexMetadata },
      flatObjectMetadataMaps,
      queryRunner,
      workspaceId,
    } = context;

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: flatIndexMetadata.objectMetadataId,
      });
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });
    // TODO find in cache
    const relatedFlatIndexFieldMetadatas = [] as FlatIndexFieldMetadata[];
    const quotedColumns = relatedFlatIndexFieldMetadatas.map(
      (column) => `"${column}"`,
    );
    if (flatIndexMetadata.indexType === IndexType.BTREE) {
      await queryRunner.query(`
              CREATE INDEX IF NOT EXISTS "${flatIndexMetadata.name}" ON "${schemaName}"."${tableName}" USING ${flatIndexMetadata.indexType} (${quotedColumns.join(', ')})
            `);
    }

    const isUnique = flatIndexMetadata.isUnique ? 'UNIQUE' : '';
    const whereClause = flatIndexMetadata.indexWhereClause
      ? `WHERE ${flatIndexMetadata.indexWhereClause}`
      : '';

    await queryRunner.query(`
              CREATE ${isUnique} INDEX IF NOT EXISTS "${flatIndexMetadata.name}" ON "${schemaName}"."${tableName}" (${quotedColumns.join(', ')}) ${whereClause}
            `);
  }
}
