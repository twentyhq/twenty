import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { EmailWorkflowActionBase } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/email-workflow-action.base';
import { isWorkflowDraftEmailAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/guards/is-workflow-draft-email-action.guard';
import { type EmailStepLogMode } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class DraftEmailWorkflowAction extends EmailWorkflowActionBase {
  constructor(
    private readonly draftEmailTool: DraftEmailTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {
    super(
      DraftEmailWorkflowAction.name,
      workflowRunStepLogService,
      globalWorkspaceOrmManager,
      connectedAccountRepository,
      userWorkspaceRepository,
    );
  }

  protected getTool(): Tool {
    return this.draftEmailTool;
  }

  protected getMode(): EmailStepLogMode {
    return 'DRAFT';
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowDraftEmailAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a draft-email action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }
}
