import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type PermissionFlagType } from 'twenty-shared/constants';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import {
  type WorkflowRunApplications,
  WorkflowRunApplicationsService,
} from 'src/modules/workflow/workflow-executor/services/workflow-run-applications.service';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { buildApplicationWorkflowRolePermissionConfig } from 'src/modules/workflow/workflow-executor/utils/build-application-workflow-role-permission-config.util';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
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
    private readonly permissionsService: PermissionsService,
    private readonly workflowRunApplicationsService: WorkflowRunApplicationsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<WorkflowExecutionContext> {
    const { workflowRun, workflowRunApplications } =
      await this.findWorkflowRunWithApplications(runInfo);

    return this.buildExecutionContext(
      workflowRun,
      runInfo.workspaceId,
      workflowRunApplications,
    );
  }

  async buildConnectedAccountToolContextOrThrow({
    runInfo,
    permissionFlag,
    shouldPassWorkspaceRunUser,
  }: {
    runInfo: WorkflowRunInfo;
    permissionFlag: PermissionFlagType;
    shouldPassWorkspaceRunUser: boolean;
  }): Promise<ToolExecutionContext> {
    const { workflowRun, workflowRunApplications } =
      await this.findWorkflowRunWithApplications(runInfo);

    if (
      workflowRunApplications.boundingApplications.length === 0 &&
      !shouldPassWorkspaceRunUser
    ) {
      return { workspaceId: runInfo.workspaceId };
    }

    const { authContext, rolePermissionConfig, actingApplication } =
      await this.buildExecutionContext(
        workflowRun,
        runInfo.workspaceId,
        workflowRunApplications,
      );

    const toolExecutionContext: ToolExecutionContext = {
      workspaceId: runInfo.workspaceId,
      ...getUserFromAuthContext(authContext),
    };

    if (!isDefined(actingApplication)) {
      return toolExecutionContext;
    }

    const hasToolPermission = await this.permissionsService.hasToolPermission(
      rolePermissionConfig,
      runInfo.workspaceId,
      permissionFlag,
    );

    if (!hasToolPermission) {
      throw new WorkflowStepExecutorException(
        `Application "${actingApplication.name}" is missing the ${permissionFlag} permission required by this step`,
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return {
      ...toolExecutionContext,
      requireConnectedAccountUsableByCaller: true,
    };
  }

  private async findWorkflowRunWithApplications(runInfo: WorkflowRunInfo) {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const workflowRunApplications =
      await this.workflowRunApplicationsService.findWorkflowRunApplications(
        workflowRun,
        runInfo.workspaceId,
      );

    return { workflowRun, workflowRunApplications };
  }

  private buildExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    workflowRunApplications: WorkflowRunApplications,
  ): Promise<WorkflowExecutionContext> {
    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    if (isActingOnBehalfOfUser) {
      return this.buildUserExecutionContext(
        workflowRun,
        workspaceId,
        workflowRunApplications,
      );
    }

    if (workflowRunApplications.boundingApplications.length > 0) {
      return this.buildBoundApplicationExecutionContext(
        workflowRun,
        workspaceId,
        workflowRunApplications,
      );
    }

    return this.buildApplicationExecutionContext(workflowRun, workspaceId);
  }

  private async buildUserExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    { owningApplication, boundingApplications }: WorkflowRunApplications,
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

    const actingApplication = boundingApplications[0] ?? null;

    const authContext: WorkspaceAuthContext = buildUserAuthContext({
      workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
      userWorkspaceId: userWorkspace.id,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId: workspaceMember.id,
      workspaceMember,
      application: actingApplication,
    });

    return {
      isActingOnBehalfOfUser: true,
      initiator: workflowRun.createdBy,
      rolePermissionConfig: isDefined(actingApplication)
        ? buildApplicationWorkflowRolePermissionConfig({
            applications: boundingApplications,
            userRoleId: roleId,
          })
        : { unionOf: [roleId] },
      authContext,
      owningApplication,
      actingApplication,
    };
  }

  private async buildBoundApplicationExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    { owningApplication, boundingApplications }: WorkflowRunApplications,
  ): Promise<WorkflowExecutionContext> {
    const rolePermissionConfig = buildApplicationWorkflowRolePermissionConfig({
      applications: boundingApplications,
    });

    const actingApplication = boundingApplications[0];

    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
    });

    return {
      isActingOnBehalfOfUser: false,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
      authContext: buildApplicationAuthContext({
        workspace: fromWorkspaceEntityToFlat(workspace),
        application: actingApplication,
      }),
      owningApplication,
      actingApplication,
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
      actingApplication: null,
    };
  }
}
