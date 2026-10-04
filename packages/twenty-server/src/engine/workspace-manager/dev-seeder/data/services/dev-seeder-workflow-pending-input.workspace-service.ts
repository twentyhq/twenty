import { Injectable } from '@nestjs/common';

import { type AskQuestionItem } from 'twenty-shared/ai';
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
import { askQuestionCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/ask-question-call.util';
import { proposeEmailCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/propose-email-call.util';
import { type SeededEmail } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-email.type';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKFLOW_PENDING_INPUT_SEED_NAMESPACE =
  '6f0a9a3e-2b1f-4c55-9f0b-7c1d2e3f4a5b';

const seedId = (name: string, workspaceId: string) =>
  v5(`${name}:${workspaceId}`, WORKFLOW_PENDING_INPUT_SEED_NAMESPACE);

const SYSTEM_ACTOR: ActorMetadata = {
  source: FieldActorSource.SYSTEM,
  workspaceMemberId: null,
  name: 'System',
  context: {},
};

const INITIATORS = {
  TIM: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    name: 'Tim Apple',
  },
  PHIL: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    name: 'Phil Schiler',
  },
} as const;

type Initiator = keyof typeof INITIATORS;

const QUALIFICATION_QUESTIONS: AskQuestionItem[] = [
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

const RENEWAL_REMINDER_EMAIL: SeededEmail = {
  to: 'procurement@stripe.com',
  subject: 'Your Twenty renewal on October 31',
  body: '<p>Hi Stripe team,</p><p>Your Twenty subscription renews on October 31 for another year at the same price. If you want to add seats or change plans before then, just reply to this email.</p><p>Best,<br>Phil</p>',
};

type AgentWorkflowToSeed = {
  key: string;
  name: string;
  position: number;
  icon: string;
  stepKey: string;
  stepName: string;
  stepPrompt: string;
  humanInputInstructions: string;
  runKey: string;
  initiator: Initiator;
  runPrompt: string;
  calls: SeededToolCall[];
};

const AGENT_WORKFLOWS_TO_SEED: AgentWorkflowToSeed[] = [
  {
    key: 'qualifyInboundLead',
    name: 'Qualify inbound lead',
    position: 3,
    icon: 'IconUserCheck',
    stepKey: 'agentStep',
    stepName: 'Qualify the lead',
    stepPrompt: 'Qualify the inbound lead and draft the first reply.',
    humanInputInstructions:
      'Ask me who should follow up when the lead could go to more than one owner.',
    runKey: 'qualification',
    initiator: 'TIM',
    runPrompt:
      'Qualify the inbound lead from Figma and decide who should follow up.',
    calls: QUALIFICATION_QUESTIONS.map(askQuestionCall),
  },
  {
    key: 'draftRenewalReminder',
    name: 'Draft renewal reminder',
    position: 4,
    icon: 'IconMail',
    stepKey: 'renewalAgentStep',
    stepName: 'Draft the reminder',
    stepPrompt:
      'Draft a renewal reminder for the account and have it reviewed before it goes out.',
    humanInputInstructions: 'Have every email reviewed before it goes out.',
    runKey: 'renewalReminder',
    initiator: 'PHIL',
    runPrompt:
      'Stripe renews on October 31. Draft the renewal reminder for their procurement team.',
    calls: [proposeEmailCall(RENEWAL_REMINDER_EMAIL)],
  },
];

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: 0 },
  continueOnFailure: { value: false },
};

type SeededWorkflow = {
  workspaceWorkflowId: string;
  workspaceWorkflowVersionId: string;
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  name: string;
  trigger: WorkflowManualTrigger;
  step: WorkflowAction;
};

@Injectable()
export class DevSeederWorkflowPendingInputWorkspaceService {
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
    for (const agentWorkflow of AGENT_WORKFLOWS_TO_SEED) {
      const workflow = await this.insertWorkflow({
        workspaceId,
        applicationId,
        key: agentWorkflow.key,
        name: agentWorkflow.name,
        position: agentWorkflow.position,
        icon: agentWorkflow.icon,
        step: {
          id: seedId(agentWorkflow.stepKey, workspaceId),
          name: agentWorkflow.stepName,
          type: WorkflowActionType.AI_AGENT,
          valid: true,
          settings: {
            input: {
              prompt: agentWorkflow.stepPrompt,
              humanInputInstructions: agentWorkflow.humanInputInstructions,
            },
            outputSchema: {},
            errorHandlingOptions: ERROR_HANDLING_OPTIONS,
          },
          nextStepIds: [],
        },
      });
      const workflowRunId = seedId(
        `workflowRun:${agentWorkflow.runKey}`,
        workspaceId,
      );
      const content = (
        await Promise.all(
          agentWorkflow.calls.map(async (call, callIndex) => {
            const toolCallId = seedId(
              callIndex === 0
                ? `toolCall:${agentWorkflow.runKey}`
                : `toolCall:${agentWorkflow.runKey}:${callIndex}`,
              workspaceId,
            );
            const { toolName, input } = call;
            const output = await call.buildPendingOutput();

            return [
              { type: 'tool-call' as const, toolCallId, toolName, input },
              {
                type: 'tool-result' as const,
                toolCallId,
                toolName,
                input,
                output,
              },
            ];
          }),
        )
      ).flat();

      await this.seedPausedRun({
        workspaceId,
        workflowRunId,
        workflow,
        initiator: agentWorkflow.initiator,
        recordConversation: () =>
          this.workflowAgentConversationService.recordExecution({
            workspaceId,
            workflowRunId,
            stepId: workflow.step.id,
            title: workflow.step.name,
            agentId: null,
            prompt: agentWorkflow.runPrompt,
            initiatorUserWorkspaceId: null,
            executionResult: {
              isPaused: true,
              steps: [{ content }],
            },
          }),
      });
    }
  }

  private async seedPausedRun({
    workspaceId,
    workflowRunId,
    workflow,
    initiator,
    recordConversation,
  }: {
    workspaceId: string;
    workflowRunId: string;
    workflow: SeededWorkflow;
    initiator: Initiator;
    recordConversation: () => Promise<unknown>;
  }): Promise<void> {
    await this.workflowRunWorkspaceService.createCoreWorkflowRun({
      workflowRunId,
      coreWorkflowId: workflow.coreWorkflowId,
      coreWorkflowVersionId: workflow.coreWorkflowVersionId,
      workspaceWorkflowId: workflow.workspaceWorkflowId,
      workspaceWorkflowVersionId: workflow.workspaceWorkflowVersionId,
      workflowName: workflow.name,
      trigger: workflow.trigger,
      steps: [workflow.step],
      createdBy: {
        source: FieldActorSource.MANUAL,
        ...INITIATORS[initiator],
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

    await recordConversation();

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: workflow.step.id,
      stepInfo: { status: StepStatus.PENDING },
      workflowRunId,
      workspaceId,
    });
  }

  private async insertWorkflow({
    workspaceId,
    applicationId,
    key,
    name,
    position,
    icon,
    step,
  }: {
    workspaceId: string;
    applicationId: string;
    key: string;
    name: string;
    position: number;
    icon: string;
    step: WorkflowAction;
  }): Promise<SeededWorkflow> {
    const workspaceWorkflowId = seedId(`workflow:${key}`, workspaceId);
    const workspaceWorkflowVersionId = seedId(
      `workflowVersion:${key}`,
      workspaceId,
    );
    const coreWorkflowId = seedId(`coreWorkflow:${key}`, workspaceId);
    const coreWorkflowVersionId = seedId(
      `coreWorkflowVersion:${key}`,
      workspaceId,
    );

    const trigger: WorkflowManualTrigger = {
      name: 'Launch manually',
      type: WorkflowTriggerType.MANUAL,
      settings: {
        outputSchema: {},
        icon,
        availability: { type: 'GLOBAL', locations: undefined },
      },
      nextStepIds: [step.id],
    };

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager
        .getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        )
        .insert({
          id: workspaceWorkflowId,
          name,
          lastPublishedVersionId: workspaceWorkflowVersionId,
          statuses: [WorkflowStatus.ACTIVE],
          position,
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
          steps: [step],
          status: WorkflowVersionStatus.ACTIVE,
          position: 1,
          workflowId: workspaceWorkflowId,
          coreWorkflowVersionId,
        });
    }, buildSystemAuthContext(workspaceId));

    await this.coreWorkflowRepository.insert(workspaceId, {
      id: coreWorkflowId,
      universalIdentifier: seedId(
        `workflowUniversalIdentifier:${key}`,
        workspaceId,
      ),
      applicationId,
      name,
      lastPublishedVersionId: workspaceWorkflowVersionId,
      workspaceWorkflowId,
      lastPublishedCoreWorkflowVersionId: coreWorkflowVersionId,
    });

    await this.coreWorkflowVersionRepository.insert(workspaceId, {
      id: coreWorkflowVersionId,
      universalIdentifier: seedId(
        `workflowVersionUniversalIdentifier:${key}`,
        workspaceId,
      ),
      applicationId,
      triggers: [trigger],
      steps: [step],
      status: WorkflowVersionStatus.ACTIVE,
      workflowId: workspaceWorkflowId,
      coreWorkflowId,
      workspaceWorkflowVersionId,
    });

    return {
      workspaceWorkflowId,
      workspaceWorkflowVersionId,
      coreWorkflowId,
      coreWorkflowVersionId,
      name,
      trigger,
      step,
    };
  }
}
