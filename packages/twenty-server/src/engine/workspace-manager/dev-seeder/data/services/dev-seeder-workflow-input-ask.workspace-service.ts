import { Injectable } from '@nestjs/common';

import { type AskQuestionItem, type ProposedEmail } from 'twenty-shared/ai';
import {
  type ActorMetadata,
  FieldActorSource,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
import {
  askQuestionsCall,
  proposeEmailCall,
  type SeededToolCall,
} from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-agent-chat-input-ask.workspace-service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowPendingAsk } from 'src/modules/workflow/workflow-executor/types/workflow-pending-ask.type';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import {
  type WorkflowAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKFLOW_INPUT_ASK_SEED_NAMESPACE =
  '6f0a9a3e-2b1f-4c55-9f0b-7c1d2e3f4a5b';

const seedId = (name: string, workspaceId: string) =>
  v5(`${name}:${workspaceId}`, WORKFLOW_INPUT_ASK_SEED_NAMESPACE);

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
  JONY: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    name: 'Jony Ive',
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

const RENEWAL_REMINDER_EMAIL: ProposedEmail = {
  recipients: { to: 'procurement@stripe.com', cc: '', bcc: '' },
  subject: 'Your Twenty renewal on October 31',
  body: 'Hi Stripe team,\n\nYour Twenty subscription renews on October 31 for another year at the same price. If you want to add seats or change plans before then, just reply to this email.\n\nBest,\nPhil',
};

type AgentWorkflowToSeed = {
  key: string;
  name: string;
  position: number;
  icon: string;
  stepKey: string;
  stepName: string;
  stepPrompt: string;
  runKey: string;
  initiator: Initiator;
  runPrompt: string;
  call: SeededToolCall;
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
    runKey: 'qualification',
    initiator: 'TIM',
    runPrompt:
      'Qualify the inbound lead from Figma and decide who should follow up.',
    call: askQuestionsCall(QUALIFICATION_QUESTIONS),
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
    runKey: 'renewalReminder',
    initiator: 'PHIL',
    runPrompt:
      'Stripe renews on October 31. Draft the renewal reminder for their procurement team.',
    call: proposeEmailCall(RENEWAL_REMINDER_EMAIL),
  },
];

const DISCOUNT_RUNS_TO_SEED: {
  suffix: string;
  initiator: Initiator;
  endStatus?: WorkflowRunStatus.COMPLETED | WorkflowRunStatus.STOPPED;
  response?: Record<string, unknown>;
}[] = [
  {
    suffix: 'Answered',
    initiator: 'TIM',
    endStatus: WorkflowRunStatus.COMPLETED,
    response: {
      discount: 15,
      justification: 'Three-year commitment signed by Airbnb procurement.',
    },
  },
  {
    suffix: 'Stopped',
    initiator: 'PHIL',
    endStatus: WorkflowRunStatus.STOPPED,
  },
  { suffix: 'Pending', initiator: 'JONY' },
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

// Seeds workflow runs waiting on a person, and runs whose wait is over, so
// the run view, the paused conversations and every kind of Ask card can be
// tried without calling a model.
@Injectable()
export class DevSeederWorkflowInputAskWorkspaceService {
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
            input: { prompt: agentWorkflow.stepPrompt, canAskQuestions: true },
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
      const toolCallId = seedId(
        `toolCall:${agentWorkflow.runKey}`,
        workspaceId,
      );
      const { toolName, input } = agentWorkflow.call;
      const output = await agentWorkflow.call.buildPendingOutput();

      await this.seedPausedRun({
        workspaceId,
        workflowRunId,
        workflow,
        initiator: agentWorkflow.initiator,
        recordPendingAsks: async () =>
          (
            await this.workflowAgentConversationService.recordExecution({
              workspaceId,
              workflowRunId,
              stepId: workflow.step.id,
              title: workflow.step.name,
              agentId: null,
              prompt: agentWorkflow.runPrompt,
              initiatorUserWorkspaceId: null,
              executionResult: {
                isPaused: true,
                steps: [
                  {
                    content: [
                      { type: 'tool-call', toolCallId, toolName, input },
                      {
                        type: 'tool-result',
                        toolCallId,
                        toolName,
                        input,
                        output,
                      },
                    ],
                  },
                ],
              },
            })
          )?.pendingAsks,
      });
    }

    const formStep: WorkflowFormAction = {
      id: seedId('formStep', workspaceId),
      name: 'Approve discount',
      type: WorkflowActionType.FORM,
      valid: true,
      settings: {
        input: [
          {
            id: seedId('formField:discount', workspaceId),
            name: 'discount',
            label: 'Approved discount (%)',
            type: FieldMetadataType.NUMBER,
            placeholder: '10',
          },
          {
            id: seedId('formField:justification', workspaceId),
            name: 'justification',
            label: 'Justification',
            type: FieldMetadataType.TEXT,
            placeholder: 'Why this discount is worth it',
          },
        ],
        outputSchema: {},
        errorHandlingOptions: ERROR_HANDLING_OPTIONS,
      },
      nextStepIds: [],
    };

    const discountWorkflow = await this.insertWorkflow({
      workspaceId,
      applicationId,
      key: 'approveDiscount',
      name: 'Approve discount',
      position: 5,
      icon: 'IconDiscount',
      step: formStep,
    });

    for (const discountRun of DISCOUNT_RUNS_TO_SEED) {
      const workflowRunId = seedId(
        `workflowRun:discount${discountRun.suffix}`,
        workspaceId,
      );

      await this.seedPausedRun({
        workspaceId,
        workflowRunId,
        workflow: discountWorkflow,
        initiator: discountRun.initiator,
        recordPendingAsks: async () => [
          {
            name: formStep.name,
            form: { kind: 'formFields', fields: formStep.settings.input },
          },
        ],
      });

      if (isDefined(discountRun.response)) {
        await this.workflowRunWorkspaceService.updateStepInfoIfPending({
          stepId: formStep.id,
          stepInfo: {
            status: StepStatus.SUCCESS,
            result: discountRun.response,
          },
          inputAskResponse: discountRun.response,
          workflowRunId,
          workspaceId,
        });
      }

      if (isDefined(discountRun.endStatus)) {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: discountRun.endStatus,
        });
      }
    }
  }

  // Parks the run's step the way the executor parks a step that waits on a
  // person, opening its Asks assigned to whoever started the run.
  private async seedPausedRun({
    workspaceId,
    workflowRunId,
    workflow,
    initiator,
    recordPendingAsks,
  }: {
    workspaceId: string;
    workflowRunId: string;
    workflow: SeededWorkflow;
    initiator: Initiator;
    recordPendingAsks: () => Promise<WorkflowPendingAsk[] | undefined>;
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

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: workflow.step.id,
      stepInfo: { status: StepStatus.PENDING },
      pendingAsks: await recordPendingAsks(),
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
