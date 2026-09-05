import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

// The inbox addresses people by their core identity while workflow runs record
// the workspace member who started them, so this translates between the two.
@Injectable()
export class WorkflowRunInboxWorkspaceService {
  private readonly logger = new Logger(WorkflowRunInboxWorkspaceService.name);

  constructor(
    private readonly inboxRouterService: InboxRouterService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
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
      this.inboxRouterService.toUserWorkspaceId({
        workspaceId,
        workspaceMemberId,
      }),
      this.resolveWorkflowRunObjectMetadataId(workspaceId),
    ]);

    if (!isDefined(userWorkspaceId)) {
      return;
    }

    // Run names follow the "#<count> - <workflow name>" convention.
    const workflowName = workflowRun.name?.match(/^#\d+ - (.+)$/)?.[1];

    await this.inboxRouterService.route({
      workspaceId,
      typeKey: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
      title: `${workflowName ?? 'Workflow'} run failed`,
      ...(isDefined(error) ? { context: { summary: error } } : {}),
      target: { kind: 'userWorkspace', userWorkspaceId },
      slotKey: `${INBOX_ITEM_TYPE_KEY.workflowRunFailed}:${workflowRun.id}`,
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

  // The metadata read throws when the object is missing; a run without a
  // subject still deserves its inbox item.
  private async resolveWorkflowRunObjectMetadataId(
    workspaceId: string,
  ): Promise<string | null> {
    try {
      const { flatObjectMetadata } =
        await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
          'workflowRun',
          workspaceId,
        );

      return flatObjectMetadata.id;
    } catch (error) {
      if (
        error instanceof WorkflowCommonException &&
        error.code === WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }
}
