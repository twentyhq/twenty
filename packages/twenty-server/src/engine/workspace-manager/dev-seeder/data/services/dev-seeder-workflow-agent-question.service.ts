import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
} from 'twenty-shared/ai';
import { FieldActorSource } from 'twenty-shared/types';
import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';
import { DataSource } from 'typeorm';
import { v5 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type RecordedExecutionResult,
  WorkflowAgentConversationWorkspaceService,
} from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE =
  '6f0a9a3e-2b1f-4c55-9f0b-7c1d2e3f4a5b';

const WORKFLOW_NAME = 'Qualify inbound lead';

const SEEDED_AGENT_QUESTION_RUNS: {
  key: string;
  prompt: string;
  questions: AskQuestionItem[];
}[] = [
  {
    key: 'discount',
    prompt:
      'Qualify the inbound lead from Anthropic and draft the first reply.',
    questions: [
      {
        header: 'Discount',
        question:
          'Anthropic asked for startup pricing. Should I offer the 20% startup discount in the first reply?',
        options: [
          {
            label: 'Offer it',
            description: 'Mention the discount in the first reply',
            isRecommended: true,
          },
          {
            label: 'Hold it',
            description: 'Keep it for the negotiation',
          },
        ],
      },
    ],
  },
  {
    key: 'qualification',
    prompt:
      'Qualify the inbound lead from Figma and decide who should follow up.',
    questions: [
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
    ],
  },
];

// Seeds a workflow whose agent step is waiting on a person, so the run view,
// the paused conversation and its question card can be tried without calling
// a model.
@Injectable()
export class DevSeederWorkflowAgentQuestionService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async seed({
    workspaceId,
    schemaName,
    applicationId,
  }: {
    workspaceId: string;
    schemaName: string;
    applicationId: string;
  }): Promise<void> {
    const seedId = (name: string) =>
      v5(`${name}:${workspaceId}`, WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE);

    const workspaceWorkflowId = seedId('workflow');
    const workspaceWorkflowVersionId = seedId('workflowVersion');
    const coreWorkflowId = seedId('coreWorkflow');
    const coreWorkflowVersionId = seedId('coreWorkflowVersion');

    const agentStep: WorkflowAiAgentAction = {
      id: seedId('agentStep'),
      name: 'Qualify the lead',
      type: WorkflowActionType.AI_AGENT,
      valid: true,
      settings: {
        input: {
          prompt: 'Qualify the inbound lead and draft the first reply.',
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
      schemaName,
      applicationId,
      workspaceWorkflowId,
      workspaceWorkflowVersionId,
      coreWorkflowId,
      coreWorkflowVersionId,
      trigger,
      agentStep,
    });

    for (const seededRun of SEEDED_AGENT_QUESTION_RUNS) {
      const workflowRunId = seedId(`workflowRun:${seededRun.key}`);

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
        prompt: seededRun.prompt,
        initiatorUserWorkspaceId: null,
        executionResult: this.buildAskingResult({
          toolCallId: seedId(`toolCall:${seededRun.key}`),
          questions: seededRun.questions,
        }),
      });
    }
  }

  private buildAskingResult({
    toolCallId,
    questions,
  }: {
    toolCallId: string;
    questions: AskQuestionItem[];
  }): RecordedExecutionResult {
    return {
      isPaused: true,
      steps: [
        {
          content: [
            {
              type: 'tool-call',
              toolCallId,
              toolName: ASK_QUESTIONS_TOOL_NAME,
              input: { questions },
            },
            {
              type: 'tool-result',
              toolCallId,
              toolName: ASK_QUESTIONS_TOOL_NAME,
              input: { questions },
              output: {
                success: true,
                message:
                  'Questions presented to the user; awaiting their answer.',
                result: { questions, status: 'pending' },
              },
            },
          ],
        },
      ],
    };
  }

  private async insertWorkflow({
    workspaceId,
    schemaName,
    applicationId,
    workspaceWorkflowId,
    workspaceWorkflowVersionId,
    coreWorkflowId,
    coreWorkflowVersionId,
    trigger,
    agentStep,
  }: {
    workspaceId: string;
    schemaName: string;
    applicationId: string;
    workspaceWorkflowId: string;
    workspaceWorkflowVersionId: string;
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
    trigger: WorkflowManualTrigger;
    agentStep: WorkflowAiAgentAction;
  }): Promise<void> {
    await this.coreDataSource.transaction(async (entityManager) => {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.workflow`, [
          'id',
          'name',
          'lastPublishedVersionId',
          'statuses',
          'position',
          'createdBySource',
          'createdByWorkspaceMemberId',
          'createdByName',
          'createdByContext',
          'updatedBySource',
          'updatedByWorkspaceMemberId',
          'updatedByName',
          'coreWorkflowId',
        ])
        .orIgnore()
        .values({
          id: workspaceWorkflowId,
          name: WORKFLOW_NAME,
          lastPublishedVersionId: workspaceWorkflowVersionId,
          statuses: ['ACTIVE'],
          position: 3,
          createdBySource: FieldActorSource.SYSTEM,
          createdByWorkspaceMemberId: null,
          createdByName: 'System',
          createdByContext: {},
          updatedBySource: FieldActorSource.SYSTEM,
          updatedByWorkspaceMemberId: null,
          updatedByName: 'System',
          coreWorkflowId,
        })
        .execute();

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(WorkflowEntity)
        .orIgnore()
        .values({
          id: coreWorkflowId,
          workspaceId,
          universalIdentifier: v5(
            `workflowUniversalIdentifier:${workspaceId}`,
            WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE,
          ),
          applicationId,
          name: WORKFLOW_NAME,
          lastPublishedVersionId: workspaceWorkflowVersionId,
          workspaceWorkflowId,
          lastPublishedCoreWorkflowVersionId: coreWorkflowVersionId,
        })
        .execute();

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.workflowVersion`, [
          'id',
          'name',
          'trigger',
          'steps',
          'status',
          'position',
          'workflowId',
          'coreWorkflowVersionId',
        ])
        .orIgnore()
        .values({
          id: workspaceWorkflowVersionId,
          name: 'v1',
          trigger: JSON.stringify(trigger),
          steps: JSON.stringify([agentStep]),
          status: 'ACTIVE',
          position: 1,
          workflowId: workspaceWorkflowId,
          coreWorkflowVersionId,
        })
        .execute();

      await entityManager
        .createQueryBuilder()
        .insert()
        .into('core.workflowVersion', [
          'id',
          'workspaceId',
          'universalIdentifier',
          'applicationId',
          'triggers',
          'steps',
          'status',
          'workflowId',
          'coreWorkflowId',
          'workspaceWorkflowVersionId',
        ])
        .orIgnore()
        .values({
          id: coreWorkflowVersionId,
          workspaceId,
          universalIdentifier: v5(
            `workflowVersionUniversalIdentifier:${workspaceId}`,
            WORKFLOW_AGENT_QUESTION_SEED_NAMESPACE,
          ),
          applicationId,
          triggers: [trigger],
          steps: [agentStep],
          status: 'ACTIVE',
          workflowId: workspaceWorkflowId,
          coreWorkflowId,
          workspaceWorkflowVersionId,
        })
        .execute();
    });
  }
}
