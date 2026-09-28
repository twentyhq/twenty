import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { buildApplicationWorkflowRolePermissionConfig } from 'src/modules/workflow/workflow-executor/utils/build-application-workflow-role-permission-config.util';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
import { resolveWorkflowRunOwningApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-owning-application.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canMemberChangeWorkflowRun } from 'src/modules/workflow/workflow-runner/utils/can-member-change-workflow-run.util';
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
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async getExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const owningApplication = await this.findOwningApplication(
      workflowRun,
      runInfo.workspaceId,
    );

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    if (isActingOnBehalfOfUser) {
      return this.buildUserExecutionContext(
        workflowRun,
        runInfo.workspaceId,
        owningApplication,
      );
    }

    if (isDefined(owningApplication)) {
      return this.buildOwningApplicationExecutionContext(
        workflowRun,
        runInfo.workspaceId,
        owningApplication,
      );
    }

    return this.buildApplicationExecutionContext(
      workflowRun,
      runInfo.workspaceId,
    );
  }

  async buildConnectedAccountToolExecutionContext({
    runInfo,
    permissionFlag,
  }: {
    runInfo: WorkflowRunInfo;
    permissionFlag: PermissionFlagType;
  }): Promise<ToolExecutionContext> {
    const { authContext, rolePermissionConfig, owningApplication } =
      await this.getExecutionContext(runInfo);

    const toolExecutionContext: ToolExecutionContext = {
      workspaceId: runInfo.workspaceId,
      ...getUserFromAuthContext(authContext),
    };

    if (!isDefined(owningApplication)) {
      return toolExecutionContext;
    }

    const hasToolPermission = await this.permissionsService.hasToolPermission(
      rolePermissionConfig,
      runInfo.workspaceId,
      permissionFlag,
    );

    if (!hasToolPermission) {
      throw new WorkflowStepExecutorException(
        `Application "${owningApplication.name}" is missing the ${permissionFlag} permission required by this step`,
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return {
      ...toolExecutionContext,
      requireConnectedAccountUsableByCaller: true,
    };
  }

  async assertMemberCanChangeRunOrThrow({
    runInfo,
    workspaceMemberId,
    replacementStep,
  }: {
    runInfo: WorkflowRunInfo;
    workspaceMemberId: string | undefined;
    replacementStep?: WorkflowAction;
  }): Promise<void> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const owningApplication = await this.findOwningApplication(
      workflowRun,
      runInfo.workspaceId,
    );

    if (
      !canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication,
        workspaceMemberId,
        replacementStep,
      })
    ) {
      throw new PermissionsException(
        'Only the member who started this application workflow run can change it',
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`Only the member who started this run can change it.`,
        },
      );
    }
  }

  private async findOwningApplication(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<FlatApplication | null> {
    const [
      { flatWorkflowMaps, flatApplicationMaps },
      { workspaceCustomFlatApplication, twentyStandardFlatApplication },
    ] = await Promise.all([
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatApplicationMaps',
      ]),
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
    ]);

    return resolveWorkflowRunOwningApplication({
      workflowRun,
      flatWorkflowMaps,
      flatApplicationMaps,
      workspaceOwnedApplicationIds: [
        workspaceCustomFlatApplication.id,
        twentyStandardFlatApplication.id,
      ],
    });
  }

  private async buildUserExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    owningApplication: FlatApplication | null,
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
      application: owningApplication,
    });

    return {
      isActingOnBehalfOfUser: true,
      initiator: workflowRun.createdBy,
      rolePermissionConfig: isDefined(owningApplication)
        ? buildApplicationWorkflowRolePermissionConfig({
            owningApplication,
            userRoleId: roleId,
          })
        : { unionOf: [roleId] },
      authContext,
      owningApplication,
    };
  }

  private async buildOwningApplicationExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    owningApplication: FlatApplication,
  ): Promise<WorkflowExecutionContext> {
    const rolePermissionConfig = buildApplicationWorkflowRolePermissionConfig({
      owningApplication,
    });

    const { workspace } =
      await this.applicationService.findTwentyStandardApplicationOrThrow(
        workspaceId,
      );

    return {
      isActingOnBehalfOfUser: false,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
      authContext: buildApplicationAuthContext({
        workspace: fromWorkspaceEntityToFlat(workspace),
        application: owningApplication,
      }),
      owningApplication,
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
      owningApplication: null,
    };
  }
}
