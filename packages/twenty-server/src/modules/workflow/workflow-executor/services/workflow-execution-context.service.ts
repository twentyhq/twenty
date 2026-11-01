import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { resolveRolePermissionConfig } from 'src/engine/permissions/principal/utils/resolve-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { resolveWorkflowRunApplicationOrThrow } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-application-or-throw.util';
import { WorkflowRunWorkspaceService as WorkflowRunService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class WorkflowExecutionContextService {
  constructor(
    private readonly workflowRunService: WorkflowRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<WorkflowExecutionContext> {
    const [workflowRun, workspace] = await Promise.all([
      this.workflowRunService.getWorkflowRunOrFail({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      }),
      this.findWorkspaceOrFail(runInfo.workspaceId),
    ]);

    return this.buildExecutionContext(workflowRun, workspace);
  }

  // workspace workflow forms still read picked records unrestricted, relations included
  async getFormRecordReadContext({
    workflowRun,
    workspaceId,
  }: {
    workflowRun: WorkflowRunWorkspaceEntity;
    workspaceId: string;
  }): Promise<WorkflowExecutionContext | null> {
    const [workspace, { flatWorkflowMaps }] = await Promise.all([
      this.findWorkspaceOrFail(workspaceId),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
      ]),
    ]);

    if (
      this.getRunApplicationId(workflowRun, flatWorkflowMaps) ===
      workspace.workspaceCustomApplicationId
    ) {
      return null;
    }

    return this.buildExecutionContext(workflowRun, workspace);
  }

  assertRunApplicationCanTriggerStepTargetOrThrow({
    executionContext: { application, authContext },
    targetApplicationId,
    targetLabel,
  }: {
    executionContext: Pick<
      WorkflowExecutionContext,
      'application' | 'authContext'
    >;
    targetApplicationId: string;
    targetLabel: string;
  }): void {
    if (
      canCallerReachApplication({
        callingApplication: application,
        applicationId: targetApplicationId,
        operation: 'trigger',
        workspaceCustomApplicationId:
          authContext.workspace.workspaceCustomApplicationId,
      })
    ) {
      return;
    }

    throw new WorkflowStepExecutorException(
      `${targetLabel} belongs to another application than "${application.name}", so this run cannot use it`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  private async buildExecutionContext(
    workflowRun: WorkflowRunWorkspaceEntity,
    workspace: WorkspaceEntity,
  ): Promise<WorkflowExecutionContext> {
    const { flatApplicationMaps, flatWorkflowMaps, userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
        'flatWorkflowMaps',
        'userWorkspaceRoleMap',
      ]);

    const application = resolveWorkflowRunApplicationOrThrow({
      applicationId: this.getRunApplicationId(workflowRun, flatWorkflowMaps),
      applicationsById: flatApplicationMaps.byId,
    });

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    const authContext = isActingOnBehalfOfUser
      ? await this.buildMemberAuthContext({
          workflowRun,
          workspace,
          application,
        })
      : buildApplicationAuthContext({
          workspace: fromWorkspaceEntityToFlat(workspace),
          application,
        });

    const rolePermissionConfig = resolveRolePermissionConfig({
      authContext,
      userWorkspaceRoleMap,
      apiKeyRoleMap: {},
      flatRoleTargetByAgentIdMaps: {},
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

  private getRunApplicationId(
    workflowRun: Pick<WorkflowRunWorkspaceEntity, 'coreWorkflowId'>,
    flatWorkflowMaps: FlatEntityMaps<FlatWorkflow>,
  ): string {
    const workflow = isDefined(workflowRun.coreWorkflowId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: workflowRun.coreWorkflowId,
          flatEntityMaps: flatWorkflowMaps,
        })
      : undefined;

    if (!isDefined(workflow)) {
      throw new WorkflowStepExecutorException(
        'The workflow of this run no longer exists',
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return workflow.applicationId;
  }

  private async buildMemberAuthContext({
    workflowRun,
    workspace,
    application,
  }: {
    workflowRun: WorkflowRunWorkspaceEntity;
    workspace: WorkspaceEntity;
    application: FlatApplication;
  }): Promise<WorkspaceAuthContext> {
    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId: workflowRun.createdBy.workspaceMemberId!,
        workspaceId: workspace.id,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId: workspace.id,
        relations: ['user'],
      });

    return buildUserAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      userWorkspaceId: userWorkspace.id,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId: workspaceMember.id,
      workspaceMember,
      application,
    });
  }

  private findWorkspaceOrFail(workspaceId: string): Promise<WorkspaceEntity> {
    return this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
    });
  }
}
