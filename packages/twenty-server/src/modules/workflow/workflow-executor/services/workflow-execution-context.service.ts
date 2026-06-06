import { Injectable } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { WorkflowRunWorkspaceService as WorkflowRunService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class WorkflowExecutionContextService {
  constructor(
    private readonly workflowRunService: WorkflowRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
    private readonly applicationService: ApplicationService,
    private readonly roleService: RoleService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getActingUserWorkspaceId(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<string | undefined> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const isManualRun =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    const workspaceMemberId = isManualRun
      ? workflowRun.createdBy.workspaceMemberId
      : await this.getWorkflowCreatorWorkspaceMemberId({
          workflowId: workflowRun.workflowId,
          workspaceId: runInfo.workspaceId,
        });

    if (!isDefined(workspaceMemberId)) {
      return undefined;
    }

    return this.resolveUserWorkspaceId({
      workspaceMemberId,
      workspaceId: runInfo.workspaceId,
    });
  }

  private async getWorkflowCreatorWorkspaceMemberId({
    workflowId,
    workspaceId,
  }: {
    workflowId: string;
    workspaceId: string;
  }): Promise<string | null | undefined> {
    const authContext = buildSystemAuthContext(workspaceId);

    const workflow = await this.globalWorkspaceOrmManager
      .executeInWorkspaceContext(async () => {
        const workflowRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            workspaceId,
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.findOne({ where: { id: workflowId } });
      }, authContext)
      .catch(() => null);

    return workflow?.createdBy?.workspaceMemberId;
  }

  private async resolveUserWorkspaceId({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<string | undefined> {
    const workspaceMember = await this.userWorkspaceService
      .getWorkspaceMemberOrThrow({ workspaceMemberId, workspaceId })
      .catch(() => undefined);

    if (!isDefined(workspaceMember)) {
      return undefined;
    }

    const userWorkspace = await this.userWorkspaceService
      .getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId,
      })
      .catch(() => undefined);

    return userWorkspace?.id;
  }

  async getExecutionContext(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    if (isActingOnBehalfOfUser) {
      return this.buildUserExecutionContext(workflowRun, runInfo.workspaceId);
    }

    return this.buildApplicationExecutionContext(
      workflowRun,
      runInfo.workspaceId,
    );
  }

  private async buildUserExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkflowExecutionContext> {
    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId: workflowRun.createdBy.workspaceMemberId!,
        workspaceId,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId,
        relations: ['workspace', 'user'],
      });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });

    const authContext: WorkspaceAuthContext = buildUserAuthContext({
      workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
      userWorkspaceId: userWorkspace.id,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId: workspaceMember.id,
      workspaceMember,
    });

    return {
      isActingOnBehalfOfUser: true,
      initiator: workflowRun.createdBy,
      rolePermissionConfig: { unionOf: [roleId] },
      authContext,
    };
  }

  private async buildApplicationExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkflowExecutionContext> {
    const { application, workspace } =
      await this.applicationService.findTwentyStandardApplicationOrThrow(
        workspaceId,
      );

    // Use the application's role if set, otherwise fall back to admin role
    // In the future we should probably assign the Admin role to the Standard Application
    let roleId = application.defaultRoleId;

    if (!isDefined(roleId)) {
      // Fallback: Look up admin role for existing workspaces without defaultRoleId
      const adminRole = await this.roleService.getRoleByUniversalIdentifier({
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        workspaceId,
      });

      roleId = adminRole?.id ?? null;
    }

    const rolePermissionConfig = isDefined(roleId)
      ? { unionOf: [roleId] }
      : { shouldBypassPermissionChecks: true as const };

    const authContext: WorkspaceAuthContext = buildApplicationAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application: {
        ...application,
        defaultRoleId: roleId,
      },
    });

    return {
      isActingOnBehalfOfUser: false,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
      authContext,
    };
  }
}
