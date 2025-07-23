import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildDefaultFieldsForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';
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
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

@Injectable()
export class WorkspaceMetadataObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'metadata'>
{
  constructor(private readonly dataSourceService: DataSourceService) {}

  runDeleteObjectMetadataMigration = async ({
    action: { flatObjectMetadata },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.delete(flatObjectMetadata.id);
  };

  runCreateObjectMetadataMigration = async ({
    action: { flatObjectMetadata },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );
    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        flatObjectMetadata.workspaceId,
      );

    await objectMetadataRepository.save({
      ...flatObjectMetadata,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
      isActive: true,
      isCustom: !flatObjectMetadata.isRemote,
      isSystem: false,
      isSearchable: !flatObjectMetadata.isRemote,
      fields: flatObjectMetadata.isRemote
        ? []
        : buildDefaultFieldsForCustomObject(flatObjectMetadata.workspaceId),
      labelIdentifierFieldMetadataId:
        flatObjectMetadata.labelIdentifierFieldMetadataId ??
        CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
    });
  };

  runUpdateObjectMetadataMigration = async ({
    action: { flatObjectMetadata, updates },
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
      ...flatObjectMetadata, // should be stricter
      ...update,
    });
  };
}
