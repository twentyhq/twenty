import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { JobGroupEntity } from 'src/engine/metadata-modules/job-group/entities/job-group.entity';
import {
  FlatDeleteJobGroupAction,
  UniversalDeleteJobGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/job-group/types/workspace-migration-job-group-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteJobGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'jobGroup',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteJobGroupAction>,
  ): Promise<FlatDeleteJobGroupAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteJobGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const jobGroupRepository =
      queryRunner.manager.getRepository<JobGroupEntity>(JobGroupEntity);

    await jobGroupRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteJobGroupAction>,
  ): Promise<void> {
    return;
  }
}
