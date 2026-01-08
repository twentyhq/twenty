import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class CreateObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'objectMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { flatEntity: flatObjectMetadata, flatFieldMetadatas } = action;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    const dataSourceRepository =
      queryRunner.manager.getRepository<DataSourceEntity>(DataSourceEntity);

    const lastDataSourceMetadata = await dataSourceRepository.findOneOrFail({
      where: {
        workspaceId: flatObjectMetadata.workspaceId,
      },
      order: { createdAt: 'DESC' },
    });

    await objectMetadataRepository.insert({
      ...flatObjectMetadata,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
    });

    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    for (const flatFieldMetadata of flatFieldMetadatas) {
      await fieldMetadataRepository.save(flatFieldMetadata);
    }
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: flatObjectMetadata, flatFieldMetadatas } = action;

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    const columnDefinitions = flatFieldMetadatas.flatMap((flatFieldMetadata) =>
      generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadata,
      }),
    );

    const enumOrCompositeFlatFieldMetadatas = flatFieldMetadatas.filter(
      (field) =>
        isEnumFlatFieldMetadata(field) || isCompositeFlatFieldMetadata(field),
    );

    const enumOperations = collectEnumOperationsForObject({
      flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
      tableName,
      operation: EnumOperation.CREATE,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    await this.workspaceSchemaManagerService.tableManager.createTable({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });
  }
}
