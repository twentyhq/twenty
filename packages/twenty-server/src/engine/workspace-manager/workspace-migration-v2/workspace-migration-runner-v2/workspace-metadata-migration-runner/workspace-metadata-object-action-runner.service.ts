import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  CreateObjectAction,
  DeleteObjectAction,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import { WorkspaceMetadataFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-field-action-runner.service';

@Injectable()
export class WorkspaceMetadataObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'metadata'>
{
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMetadataFieldActionRunnerService: WorkspaceMetadataFieldActionRunnerService,
  ) {}

  runDeleteObjectMetadataMigration = async ({
    action: { objectMetadataId },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.delete(objectMetadataId);
  };

  runCreateObjectMetadataMigration = async ({
    action: { flatObjectMetadataWithoutFields, createFieldActions },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );
    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        flatObjectMetadataWithoutFields.workspaceId,
      );

    await objectMetadataRepository.save({
      ...flatObjectMetadataWithoutFields,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
    });

    for (const createFieldAction of createFieldActions) {
      await this.workspaceMetadataFieldActionRunnerService.runCreateFieldMetadataMigration(
        {
          action: createFieldAction,
          queryRunner,
        },
      );
    }
  };

  runUpdateObjectMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.update(
      action.objectMetadataId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  };
}
