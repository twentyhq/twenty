import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@WorkspaceQueryHook({
  key: `workflow.createMany`,
  type: WorkspaceQueryHookType.PostHook,
})
export class WorkflowCreateManyPostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersionsToCreate = payload.map((workflow) => {
      return workflowVersionRepository.create({
        workflowId: workflow.id,
        status: WorkflowVersionStatus.DRAFT,
        name: 'v1',
      });
    });

    await Promise.all(
      workflowVersionsToCreate.map((workflowVersion) => {
        return workflowVersionRepository.save(workflowVersion);
      }),
    );

    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workflowVersion',
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workflowVersion',
      action: DatabaseEventAction.CREATED,
      events: workflowVersionsToCreate.map((workflowVersionToCreate) => {
        return {
          userId: authContext.user?.id,
          recordId: workflowVersionToCreate.id,
          objectMetadata,
          properties: {
            after: workflowVersionToCreate,
          },
        };
      }),
      workspaceId: authContext.workspace.id,
    });
  }
}
