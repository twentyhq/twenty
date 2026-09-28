import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { resolveWorkflowRunOwningApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-owning-application.util';
import { resolveWorkflowRunStartingApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-starting-application.util';

export type WorkflowRunApplications = {
  owningApplication: FlatApplication | null;
  boundingApplications: FlatApplication[];
};

@Injectable()
export class WorkflowRunApplicationsService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
  ) {}

  async findWorkflowRunApplications(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkflowRunApplications> {
    const [
      { flatApplicationMaps },
      { workspaceCustomFlatApplication, twentyStandardFlatApplication },
      coreWorkflow,
    ] = await Promise.all([
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]),
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
      isDefined(workflowRun.coreWorkflowId)
        ? this.coreWorkflowRepository.findOne(workspaceId, {
            where: { id: workflowRun.coreWorkflowId },
            select: { id: true, applicationId: true },
          })
        : null,
    ]);

    const workspaceOwnedApplicationIds = [
      workspaceCustomFlatApplication.id,
      twentyStandardFlatApplication.id,
    ];

    const owningApplication = resolveWorkflowRunOwningApplication({
      workflowRun,
      coreWorkflow,
      flatApplicationMaps,
      workspaceOwnedApplicationIds,
    });

    const startingApplication = resolveWorkflowRunStartingApplication({
      workflowRun,
      flatApplicationMaps,
      workspaceOwnedApplicationIds,
    });

    const boundingApplications = [owningApplication, startingApplication]
      .filter(isDefined)
      .filter(
        (application, index, applications) =>
          applications.findIndex(({ id }) => id === application.id) === index,
      );

    return { owningApplication, boundingApplications };
  }
}
