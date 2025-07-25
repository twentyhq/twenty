import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FlatObjectMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-object-metadata-comparator.util';
import {
  CreateObjectAction,
  DeleteObjectAction,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMetadataObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'metadata'>
{
  constructor(private readonly dataSourceService: DataSourceService) {}

  runDeleteObjectMetadataMigration = async ({
    action: { flatObjectMetadataWithoutFields },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.delete(flatObjectMetadataWithoutFields.id);
  };

  runCreateObjectMetadataMigration = async ({
    action: { flatObjectMetadataWithoutFields },
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
  };

  runUpdateObjectMetadataMigration = async ({
    action: { flatObjectMetadataWithoutFields, updates },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    const update = updates.reduce<
      Partial<Pick<FlatObjectMetadata, FlatObjectMetadataPropertiesToCompare>>
    >((acc, { property, to }) => {
      return {
        ...acc,
        [property]: to,
      };
    }, {});

    await objectMetadataRepository.save({
      ...flatObjectMetadataWithoutFields, // could be stricter
      ...update,
    });
  };
}
