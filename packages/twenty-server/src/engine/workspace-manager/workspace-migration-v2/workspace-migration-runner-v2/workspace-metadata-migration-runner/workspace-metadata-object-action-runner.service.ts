import { Injectable } from '@nestjs/common';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import {
  CreateObjectAction,
  DeleteObjectAction,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

@Injectable()
export class WorkspaceMetadataObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'metadata'>
{
  runDeleteObjectMetadataMigration = async ({
    action: { flatObjectMetadata },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>) => {
    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );
    // This could be infer by the builder as N delete_field action :thinking:
    const fieldMetadataIds = flatObjectMetadata.flatFieldMetadatas.flatMap(
      (flatField) => {
        if (isDefined(flatField.relationTargetFieldMetadataId)) {
          return [flatField.id, flatField.relationTargetFieldMetadataId];
        }

        return [flatField.id];
      },
    );

    await fieldMetadataRepository.delete({
      id: In(fieldMetadataIds)
    })
    await objectMetadataRepository.delete(flatObjectMetadata.id);
  };
  runCreateObjectMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>) => {
    return;
  };
  runUpdateObjectMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>) => {
    return;
  };
}
