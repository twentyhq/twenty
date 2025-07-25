import { In } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

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

    const { flatFieldMetadata } = action;

    await fieldMetadataRepository.delete({
      id: In([flatFieldMetadata.id]),
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

    // We need to defer here in case we create a relation the relationTargetFieldMetadataId might not already be created here
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

    const { flatFieldMetadata, updates } = action;
    const update = updates.reduce<
      Partial<Pick<FlatFieldMetadata, FlatFieldMetadataPropertiesToCompare>>
    >((acc, { property, to }) => {
      return {
        ...acc,
        [property]: to,
      };
    }, {});

    await fieldMetadataRepository.update(flatFieldMetadata.id, update);
  };
}
