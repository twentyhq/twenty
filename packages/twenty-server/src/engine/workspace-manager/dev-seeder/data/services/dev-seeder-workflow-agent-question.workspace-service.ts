import { Injectable } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
} from 'twenty-shared/ai';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';
import { v5 } from 'uuid';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE =
  '6f0a9a3e-2b1f-4c55-9f0b-7c1d2e3f4a5b';

const seedId = (name: string, workspaceId: string) =>
  v5(`${name}:${workspaceId}`, WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE);

const WORKFLOW_NAME = 'Qualify inbound lead';

const SYSTEM_ACTOR: ActorMetadata = {
  source: FieldActorSource.SYSTEM,
  workspaceMemberId: null,
  name: 'System',
  context: {},
};

const PROMPT =
  'Qualify the inbound lead from Figma and decide who should follow up.';

const QUESTIONS: AskQuestionItem[] = [
  {
    header: 'Budget',
    question: 'Which budget range did Figma mention on the demo call?',
    options: [
      { label: 'Under $10k' },
      { label: '$10k to $50k', isRecommended: true },
      { label: 'Over $50k' },
    ],
  },
  {
    header: 'Owner',
    question: 'Who should own the follow-up?',
    options: [
      { label: 'Tim', description: 'Account executive' },
      { label: 'Phil', description: 'Solutions engineer' },
    ],
  },
  {
    header: 'Channels',
    question: 'Which channels should the follow-up use?',
    allowMultiSelect: true,
    options: [
      { label: 'Email', isRecommended: true },
      { label: 'Call' },
      { label: 'LinkedIn' },
    ],
  },
];

// Seeds a workflow whose agent step is waiting on a person, so the run view,
// the paused conversation and its question card can be tried without calling
// a model.
@Injectable()
export class DevSeederWorkflowAgentQuestionWorkspaceService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async seed({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const workspaceWorkflowId = seedId('workflow', workspaceId);
    const workspaceWorkflowVersionId = seedId('workflowVersion', workspaceId);
    const coreWorkflowId = seedId('coreWorkflow', workspaceId);
    const coreWorkflowVersionId = seedId('coreWorkflowVersion', workspaceId);

    const agentStep: WorkflowAiAgentAction = {
      id: seedId('agentStep', workspaceId),
      name: 'Qualify the lead',
      type: WorkflowActionType.AI_AGENT,
      valid: true,
      settings: {
        input: {
          prompt: PROMPT,
          canAskQuestions: true,
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
      nextStepIds: [],
    };

    const trigger: WorkflowManualTrigger = {
      name: 'Launch manually',
      type: WorkflowTriggerType.MANUAL,
      settings: {
        outputSchema: {},
        icon: 'IconUserCheck',
        availability: { type: 'GLOBAL', locations: undefined },
      },
      nextStepIds: [agentStep.id],
    };

    await this.insertWorkflow({
      workspaceId,
      applicationId,
      workspaceWorkflowId,
      workspaceWorkflowVersionId,
      coreWorkflowId,
      coreWorkflowVersionId,
      trigger,
      agentStep,
    });

    const workflowRunId = seedId('workflowRun', workspaceId);
    const toolCallId = seedId('toolCall', workspaceId);

    await this.workflowRunWorkspaceService.createCoreWorkflowRun({
      workflowRunId,
      coreWorkflowId,
      coreWorkflowVersionId,
      workspaceWorkflowId,
      workspaceWorkflowVersionId,
      workflowName: WORKFLOW_NAME,
      trigger,
      steps: [agentStep],
      createdBy: {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        name: 'Tim Apple',
        context: {},
      },
      status: WorkflowRunStatus.NOT_STARTED,
      triggerPayload: {},
      workspaceId,
    });

    await this.workflowRunWorkspaceService.startWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: agentStep.id,
      stepInfo: { status: StepStatus.PENDING },
      workflowRunId,
      workspaceId,
    });

    await this.workflowAgentConversationService.recordExecution({
      workspaceId,
      workflowRunId,
      stepId: agentStep.id,
      title: agentStep.name,
      agentId: null,
      prompt: PROMPT,
      initiatorUserWorkspaceId: null,
      executionResult: {
        isPaused: true,
        steps: [
          {
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: ASK_QUESTIONS_TOOL_NAME,
                input: { questions: QUESTIONS },
              },
              {
                type: 'tool-result',
                toolCallId,
                toolName: ASK_QUESTIONS_TOOL_NAME,
                input: { questions: QUESTIONS },
                output: {
                  success: true,
                  message:
                    'Questions presented to the user; awaiting their answer.',
                  result: { questions: QUESTIONS, status: 'pending' },
                },
              },
            ],
          },
        ],
      },
    });
  }

  private async insertWorkflow({
    workspaceId,
    applicationId,
    workspaceWorkflowId,
    workspaceWorkflowVersionId,
    coreWorkflowId,
    coreWorkflowVersionId,
    trigger,
    agentStep,
  }: {
    workspaceId: string;
    applicationId: string;
    workspaceWorkflowId: string;
    workspaceWorkflowVersionId: string;
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
    trigger: WorkflowManualTrigger;
    agentStep: WorkflowAiAgentAction;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager
        .getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        )
        .insert({
          id: workspaceWorkflowId,
          name: WORKFLOW_NAME,
          lastPublishedVersionId: workspaceWorkflowVersionId,
          statuses: [WorkflowStatus.ACTIVE],
          position: 3,
          createdBy: SYSTEM_ACTOR,
          updatedBy: SYSTEM_ACTOR,
          coreWorkflowId,
        });

      await this.workspaceOrmManager
        .getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        )
        .insert({
          id: workspaceWorkflowVersionId,
          name: 'v1',
          trigger,
          steps: [agentStep],
          status: WorkflowVersionStatus.ACTIVE,
          position: 1,
          workflowId: workspaceWorkflowId,
          coreWorkflowVersionId,
        });
    }, buildSystemAuthContext(workspaceId));

    await this.coreWorkflowRepository.insert(workspaceId, {
      id: coreWorkflowId,
      universalIdentifier: seedId('workflowUniversalIdentifier', workspaceId),
      applicationId,
      name: WORKFLOW_NAME,
      lastPublishedVersionId: workspaceWorkflowVersionId,
      workspaceWorkflowId,
      lastPublishedCoreWorkflowVersionId: coreWorkflowVersionId,
    });

    await this.coreWorkflowVersionRepository.insert(workspaceId, {
      id: coreWorkflowVersionId,
      universalIdentifier: seedId(
        'workflowVersionUniversalIdentifier',
        workspaceId,
      ),
      applicationId,
      triggers: [trigger],
      steps: [agentStep],
      status: WorkflowVersionStatus.ACTIVE,
      workflowId: workspaceWorkflowId,
      coreWorkflowId,
      workspaceWorkflowVersionId,
    });
  }
}
