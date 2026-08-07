import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// The inbox addresses people by their core identity, while workflow runs record
// the workspace member who started them, so this producer translates between
// the two before routing.
@Injectable()
export class WorkflowRunInboxService {
  private readonly logger = new Logger(WorkflowRunInboxService.name);

  constructor(
    private readonly inboxRouterService: InboxRouterService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  // Best effort: a run that already finished must not be reported as failing to
  // finish because its inbox item could not be routed.
  async onWorkflowRunFailed(args: {
    workflowRun: Pick<WorkflowRunWorkspaceEntity, 'id' | 'name' | 'createdBy'>;
    workspaceId: string;
    error?: string;
  }): Promise<void> {
    try {
      await this.routeFailedRun(args);
    } catch (error) {
      this.logger.warn(
        `Failed to route the inbox item for workflow run ${
          args.workflowRun.id
        }: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async routeFailedRun({
    workflowRun,
    workspaceId,
    error,
  }: {
    workflowRun: Pick<WorkflowRunWorkspaceEntity, 'id' | 'name' | 'createdBy'>;
    workspaceId: string;
    error?: string;
  }): Promise<void> {
    const workspaceMemberId = workflowRun.createdBy?.workspaceMemberId;

    if (!isDefined(workspaceMemberId)) {
      return;
    }

    const userWorkspaceId = await this.resolveUserWorkspaceId({
      workspaceId,
      workspaceMemberId,
    });

    if (!isDefined(userWorkspaceId)) {
      return;
    }

    // Run names follow the "#<count> - <workflow name>" convention
    const workflowName = workflowRun.name?.match(/^#\d+ - (.+)$/)?.[1];

    const workflowRunObjectMetadataId =
      await this.resolveWorkflowRunObjectMetadataId(workspaceId);

    await this.inboxRouterService.route({
      workspaceId,
      typeKey: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
      title: `${workflowName ?? 'Workflow'} run failed`,
      preview: error,
      fallbackAssigneeUserWorkspaceId: userWorkspaceId,
      dedupeKey: `${INBOX_ITEM_TYPE_KEY.workflowRunFailed}:${workflowRun.id}`,
      payload: { workflowRunId: workflowRun.id },
      ...(isDefined(workflowRunObjectMetadataId)
        ? {
            subject: {
              kind: 'record' as const,
              objectMetadataId: workflowRunObjectMetadataId,
              recordId: workflowRun.id,
            },
          }
        : {}),
    });
  }

  private async resolveWorkflowRunObjectMetadataId(
    workspaceId: string,
  ): Promise<string | null> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: { workspaceId, nameSingular: 'workflowRun' },
    });

    return objectMetadata?.id ?? null;
  }

  private async resolveUserWorkspaceId({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string | null> {
    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: { id: workspaceMemberId },
    });

    if (!isDefined(workspaceMember?.userId)) {
      return null;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    return userWorkspace?.id ?? null;
  }
}
