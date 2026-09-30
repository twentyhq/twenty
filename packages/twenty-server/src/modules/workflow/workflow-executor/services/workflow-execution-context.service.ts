import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { assertStepTargetBelongsToRunApplication } from 'src/modules/workflow/workflow-executor/utils/assert-step-target-belongs-to-run-application.util';
import { resolveWorkflowRunApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-application.util';
import { WorkflowRunWorkspaceService as WorkflowRunService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class WorkflowExecutionContextService {
  constructor(
    private readonly workflowRunService: WorkflowRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly applicationService: ApplicationService,
    private readonly roleService: RoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    return this.buildExecutionContext(workflowRun, runInfo.workspaceId);
  }

  async getApplicationBoundExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<WorkflowExecutionContext | null> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    if (!isDefined(workflowRun.createdBy.context?.applicationId)) {
      return null;
    }

    return this.buildExecutionContext(workflowRun, runInfo.workspaceId);
  }

  async assertStepTargetBelongsToRunApplicationOrThrow({
    application,
    workspaceId,
    targetApplicationId,
    targetLabel,
  }: {
    application: FlatApplication | null;
    workspaceId: string;
    targetApplicationId: string | null;
    targetLabel: string;
  }): Promise<void> {
    if (!isDefined(application)) {
      return;
    }

    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    assertStepTargetBelongsToRunApplication({
      application,
      targetApplicationId,
      workspaceOwnedApplicationIds: [
        workspaceCustomFlatApplication.id,
        twentyStandardFlatApplication.id,
      ],
      targetLabel,
    });
  }

  private async buildExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<WorkflowExecutionContext> {
    const application = await this.findRunApplication(workflowRun, workspaceId);

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    const authContext = await this.buildAuthContext({
      workflowRun,
      workspaceId,
      application,
      isActingOnBehalfOfUser,
    });

    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    const rolePermissionConfig = resolveRolePermissionConfig({
      authContext,
      userWorkspaceRoleMap,
      apiKeyRoleMap: {},
    });

    if (!isDefined(rolePermissionConfig)) {
      throw new WorkflowStepExecutorException(
        'No role is left to run this step with',
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return {
      isActingOnBehalfOfUser,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
      authContext,
      application,
    };
  }

  private async findRunApplication(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
  ): Promise<FlatApplication | null> {
    if (!isDefined(workflowRun.createdBy.context?.applicationId)) {
      return null;
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return resolveWorkflowRunApplication({ workflowRun, flatApplicationMaps });
  }

  private buildAuthContext({
    workflowRun,
    workspaceId,
    application,
    isActingOnBehalfOfUser,
  }: {
    workflowRun: WorkflowRunWorkspaceEntity;
    workspaceId: string;
    application: FlatApplication | null;
    isActingOnBehalfOfUser: boolean;
  }): Promise<WorkspaceAuthContext> {
    if (isActingOnBehalfOfUser) {
      return this.buildMemberAuthContext(workflowRun, workspaceId, application);
    }

    if (isDefined(application)) {
      return this.buildBoundApplicationAuthContext(workspaceId, application);
    }

    return this.buildStandardApplicationAuthContext(workspaceId);
  }

  private async buildMemberAuthContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    application: FlatApplication | null,
  ): Promise<WorkspaceAuthContext> {
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

    return buildUserAuthContext({
      workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
      userWorkspaceId: userWorkspace.id,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId: workspaceMember.id,
      workspaceMember,
      application,
    });
  }

  private async buildBoundApplicationAuthContext(
    workspaceId: string,
    application: FlatApplication,
  ): Promise<WorkspaceAuthContext> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
    });

    return buildApplicationAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application,
    });
  }

  private async buildStandardApplicationAuthContext(
    workspaceId: string,
  ): Promise<WorkspaceAuthContext> {
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

    return buildApplicationAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application: {
        ...application,
        defaultRoleId: roleId,
      },
    });
  }
}
