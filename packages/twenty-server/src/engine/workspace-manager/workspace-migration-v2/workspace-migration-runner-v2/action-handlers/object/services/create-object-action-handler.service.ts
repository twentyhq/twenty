import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class CreateObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_object',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { flatObjectMetadataWithoutFields, createFieldActions } = action;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    const dataSourceRepository =
      queryRunner.manager.getRepository<DataSourceEntity>(DataSourceEntity);

    const lastDataSourceMetadata = await dataSourceRepository.findOneOrFail({
      where: {
        workspaceId: flatObjectMetadataWithoutFields.workspaceId,
      },
      order: { createdAt: 'DESC' },
    });

    await objectMetadataRepository.save({
      ...flatObjectMetadataWithoutFields,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
    });

    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    for (const createFieldAction of createFieldActions) {
      const { flatFieldMetadata } = createFieldAction;

      await fieldMetadataRepository.save(flatFieldMetadata);
    }
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatObjectMetadataWithoutFields, createFieldActions } = action;

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata: flatObjectMetadataWithoutFields,
    });

    const flatFieldMetadatas = createFieldActions.map(
      (createFieldAction) => createFieldAction.flatFieldMetadata,
    );

    const columnDefinitions = flatFieldMetadatas.flatMap((flatFieldMetadata) =>
      generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadataWithoutFields,
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

    await this.createObjectRelatedRecords(
      flatObjectMetadataWithoutFields,
      flatFieldMetadatas,
      workspaceId,
    );
  }

  public async createObjectRelatedRecords(
    flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields,
    flatFieldMetadatas: FlatFieldMetadata[],
    workspaceId: string,
  ) {
    const view = await this.createView(
      flatObjectMetadataWithoutFields,
      workspaceId,
    );

    await this.createViewFields(flatFieldMetadatas, view.id, workspaceId);
    await this.createViewWorkspaceFavorite(workspaceId, view.id);
  }

  private async createView(
    flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields,
    workspaceId: string,
  ): Promise<ViewWorkspaceEntity> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
      );

    const createdView = await viewRepository.save({
      objectMetadataId: flatObjectMetadataWithoutFields.id,
      type: 'table',
      name: `All ${flatObjectMetadataWithoutFields.labelPlural}`,
      key: 'INDEX',
      icon: 'IconList',
    });

    return createdView;
  }

  private async createViewFields(
    flatFieldMetadatas: FlatFieldMetadata[],
    viewId: string,
    workspaceId: string,
  ): Promise<void> {
    const viewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
        workspaceId,
        'viewField',
      );

    const viewFields = flatFieldMetadatas
      .filter((field) => field.name !== 'id' && field.name !== 'deletedAt')
      .map((field, index) => ({
        fieldMetadataId: field.id,
        position: index,
        isVisible: true,
        size: 180,
        viewId: viewId,
      }));

    await viewFieldRepository.insert(viewFields);
  }

  private async createViewWorkspaceFavorite(
    workspaceId: string,
    viewId: string,
  ): Promise<void> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    await favoriteRepository.insert(
      favoriteRepository.create({
        viewId: viewId,
        position: favoriteCount,
      }),
    );
  }
}
