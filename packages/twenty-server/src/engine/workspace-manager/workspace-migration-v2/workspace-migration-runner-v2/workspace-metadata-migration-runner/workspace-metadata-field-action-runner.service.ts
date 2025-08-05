import { In } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { applyWorkspaceMigrationUpdateActionUpdates } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/apply-workspace-migration-update-action-updates.util';

export class WorkspaceMetadataFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'metadata'>
{
  runDeleteFieldMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>) => {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { fieldMetadataId } = action;

    await fieldMetadataRepository.delete({
      id: In([fieldMetadataId]),
    });
  };

  runCreateFieldMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>) => {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { flatFieldMetadata } = action;

    await fieldMetadataRepository.save(flatFieldMetadata);
  };
  runUpdateFieldMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>) => {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { fieldMetadataId } = action;

    await fieldMetadataRepository.update(
      fieldMetadataId,
      applyWorkspaceMigrationUpdateActionUpdates(action),
    );
  };
}
