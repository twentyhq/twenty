import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
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
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
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
import { buildWorkflowRunCreatedBy } from 'src/modules/workflow/workflow-executor/utils/build-workflow-run-created-by.util';
import { resolveWorkflowRunApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-application.util';
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
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async buildRunCreatedBy({
    workspaceId,
    source,
    workflowApplicationId,
  }: {
    workspaceId: string;
    source: ActorMetadata;
    workflowApplicationId: string;
  }): Promise<ActorMetadata> {
    return buildWorkflowRunCreatedBy({
      source,
      workflowApplicationId,
      workspaceOwnedApplicationIds:
        await this.findWorkspaceOwnedApplicationIds(workspaceId),
    });
  }

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

    assertStepTargetBelongsToRunApplication({
      application,
      targetApplicationId,
      workspaceOwnedApplicationIds:
        await this.findWorkspaceOwnedApplicationIds(workspaceId),
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

    if (isActingOnBehalfOfUser) {
      return this.buildUserExecutionContext(
        workflowRun,
        workspaceId,
        application,
      );
    }

    if (isDefined(application)) {
      return this.buildBoundApplicationExecutionContext(
        workflowRun,
        workspaceId,
        application,
      );
    }

    return this.buildApplicationExecutionContext(workflowRun, workspaceId);
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

  private async buildUserExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    application: FlatApplication | null,
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
      application,
    });

    return {
      isActingOnBehalfOfUser: true,
      initiator: workflowRun.createdBy,
      rolePermissionConfig: isDefined(application)
        ? this.resolveBoundRolePermissionConfigOrThrow(authContext, {
            [userWorkspace.id]: roleId,
          })
        : { unionOf: [roleId] },
      authContext,
      application,
    };
  }

  private async buildBoundApplicationExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspaceId: string,
    application: FlatApplication,
  ): Promise<WorkflowExecutionContext> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
    });

    const authContext = buildApplicationAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application,
    });

    return {
      isActingOnBehalfOfUser: false,
      initiator: workflowRun.createdBy,
      rolePermissionConfig: this.resolveBoundRolePermissionConfigOrThrow(
        authContext,
        {},
      ),
      authContext,
      application,
    };
  }

  private resolveBoundRolePermissionConfigOrThrow(
    authContext: WorkspaceAuthContext,
    userWorkspaceRoleMap: UserWorkspaceRoleMap,
  ): RolePermissionConfig {
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

    return rolePermissionConfig;
  }

  private async findWorkspaceOwnedApplicationIds(
    workspaceId: string,
  ): Promise<string[]> {
    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return [
      workspaceCustomFlatApplication.id,
      twentyStandardFlatApplication.id,
    ];
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
      application: null,
    };
  }
}
