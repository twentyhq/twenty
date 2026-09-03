import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// The inbox addresses people by their core identity, while workflow runs record
// the workspace member who started them, so this producer translates between
// the two before routing.
@Injectable()
export class WorkflowRunInboxWorkspaceService {
  private readonly logger = new Logger(WorkflowRunInboxWorkspaceService.name);

  constructor(
    private readonly inboxRouterService: InboxRouterService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  // The lookups below run before the router does, so the flag is checked here
  // too rather than letting a disabled workspace pay for them on every failure.
  async onWorkflowRunFailed(args: {
    workflowRun: Pick<WorkflowRunWorkspaceEntity, 'id' | 'name' | 'createdBy'>;
    workspaceId: string;
    error?: string;
  }): Promise<void> {
    try {
      const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_INBOX_ENABLED,
        args.workspaceId,
      );

      if (!isInboxEnabled) {
        return;
      }

      await this.routeFailedRun(args);
    } catch (error) {
      this.logger.warn(
        `Could not update the inbox for failed workflow run ${
          args.workflowRun.id
        } in workspace ${args.workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
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

    const [userWorkspaceId, workflowRunObjectMetadataId] = await Promise.all([
      this.resolveUserWorkspaceId({ workspaceId, workspaceMemberId }),
      this.resolveWorkflowRunObjectMetadataId(workspaceId),
    ]);

    if (!isDefined(userWorkspaceId)) {
      return;
    }

    // Run names follow the "#<count> - <workflow name>" convention
    const workflowName = workflowRun.name?.match(/^#\d+ - (.+)$/)?.[1];

    await this.inboxRouterService.route({
      workspaceId,
      typeKey: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
      title: `${workflowName ?? 'Workflow'} run failed`,
      preview: error,
      target: { kind: 'userWorkspace', userWorkspaceId },
      slotKey: `${INBOX_ITEM_TYPE_KEY.workflowRunFailed}:${workflowRun.id}`,
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
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember?.userId)) {
      return null;
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
      });

    return userWorkspace?.id ?? null;
  }
}
