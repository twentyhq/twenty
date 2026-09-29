import { Injectable } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
  PROPOSE_EMAIL_TOOL_NAME,
  type ProposedEmail,
} from 'twenty-shared/ai';
import {
  type ActorMetadata,
  FieldActorSource,
  FieldMetadataType,
} from 'twenty-shared/types';
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
import {
  type RecordedExecutionResult,
  WorkflowAgentConversationWorkspaceService,
} from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKFLOW_INPUT_ASK_SEED_NAMESPACE =
  '6f0a9a3e-2b1f-4c55-9f0b-7c1d2e3f4a5b';

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

const DISCOUNT_APPROVAL_RESPONSE = {
  discount: 15,
  justification: 'Three-year commitment signed by Airbnb procurement.',
};

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
    const seedId = (name: string) =>
      v5(`${name}:${workspaceId}`, WORKFLOW_INPUT_ASK_SEED_NAMESPACE);

    const qualifyWorkflow = await this.insertWorkflow({
      workspaceId,
      applicationId,
      seedId,
      key: 'qualifyInboundLead',
      name: 'Qualify inbound lead',
      position: 3,
      icon: 'IconUserCheck',
      step: this.buildAgentStep({
        id: seedId('agentStep'),
        name: 'Qualify the lead',
        prompt: 'Qualify the inbound lead and draft the first reply.',
      }),
    });

    await this.seedAgentRun({
      workspaceId,
      workflowRunId: seedId('workflowRun:qualification'),
      workflow: qualifyWorkflow,
      initiator: 'TIM',
      prompt:
        'Qualify the inbound lead from Figma and decide who should follow up.',
      executionResult: this.buildPausedResult({
        toolCallId: seedId('toolCall:qualification'),
        toolName: ASK_QUESTIONS_TOOL_NAME,
        input: { questions: QUALIFICATION_QUESTIONS },
        output: {
          success: true,
          message: 'Questions presented to the user; awaiting their answer.',
          result: { questions: QUALIFICATION_QUESTIONS, status: 'pending' },
        },
      }),
    });

    const renewalWorkflow = await this.insertWorkflow({
      workspaceId,
      applicationId,
      seedId,
      key: 'draftRenewalReminder',
      name: 'Draft renewal reminder',
      position: 4,
      icon: 'IconMail',
      step: this.buildAgentStep({
        id: seedId('renewalAgentStep'),
        name: 'Draft the reminder',
        prompt:
          'Draft a renewal reminder for the account and have it reviewed before it goes out.',
      }),
    });

    await this.seedAgentRun({
      workspaceId,
      workflowRunId: seedId('workflowRun:renewalReminder'),
      workflow: renewalWorkflow,
      initiator: 'PHIL',
      prompt:
        'Stripe renews on October 31. Draft the renewal reminder for their procurement team.',
      executionResult: this.buildPausedResult({
        toolCallId: seedId('toolCall:renewalReminder'),
        toolName: PROPOSE_EMAIL_TOOL_NAME,
        input: RENEWAL_REMINDER_EMAIL,
        output: {
          success: true,
          message: 'Email proposed to the user; awaiting their decision.',
          result: { status: 'pending', email: RENEWAL_REMINDER_EMAIL },
        },
      }),
    });

    const formStep: WorkflowFormAction = {
      id: seedId('formStep'),
      name: 'Approve discount',
      type: WorkflowActionType.FORM,
      valid: true,
      settings: {
        input: [
          {
            id: seedId('formField:discount'),
            name: 'discount',
            label: 'Approved discount (%)',
            type: FieldMetadataType.NUMBER,
            placeholder: '10',
          },
          {
            id: seedId('formField:justification'),
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
      seedId,
      key: 'approveDiscount',
      name: 'Approve discount',
      position: 5,
      icon: 'IconDiscount',
      step: formStep,
    });

    const answeredRunId = seedId('workflowRun:discountAnswered');

    await this.seedFormRun({
      workspaceId,
      workflowRunId: answeredRunId,
      workflow: discountWorkflow,
      formStep,
      initiator: 'TIM',
    });

    await this.workflowRunWorkspaceService.updateStepInfoIfPending({
      stepId: formStep.id,
      stepInfo: {
        status: StepStatus.SUCCESS,
        result: DISCOUNT_APPROVAL_RESPONSE,
      },
      inputAskResponse: DISCOUNT_APPROVAL_RESPONSE,
      workflowRunId: answeredRunId,
      workspaceId,
    });

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId: answeredRunId,
      workspaceId,
      status: WorkflowRunStatus.COMPLETED,
    });

    const stoppedRunId = seedId('workflowRun:discountStopped');

    await this.seedFormRun({
      workspaceId,
      workflowRunId: stoppedRunId,
      workflow: discountWorkflow,
      formStep,
      initiator: 'PHIL',
    });

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId: stoppedRunId,
      workspaceId,
      status: WorkflowRunStatus.STOPPED,
    });

    await this.seedFormRun({
      workspaceId,
      workflowRunId: seedId('workflowRun:discountPending'),
      workflow: discountWorkflow,
      formStep,
      initiator: 'JONY',
    });
  }

  private buildAgentStep({
    id,
    name,
    prompt,
  }: {
    id: string;
    name: string;
    prompt: string;
  }): WorkflowAiAgentAction {
    return {
      id,
      name,
      type: WorkflowActionType.AI_AGENT,
      valid: true,
      settings: {
        input: { prompt, canAskQuestions: true },
        outputSchema: {},
        errorHandlingOptions: ERROR_HANDLING_OPTIONS,
      },
      nextStepIds: [],
    };
  }

  private async startRun({
    workspaceId,
    workflowRunId,
    workflow,
    initiator,
  }: {
    workspaceId: string;
    workflowRunId: string;
    workflow: SeededWorkflow;
    initiator: Initiator;
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
  }

  // Parked the way the executor parks a step that asked, which is what opens
  // its Ask, assigned to whoever started the run.
  private async seedAgentRun({
    workspaceId,
    workflowRunId,
    workflow,
    initiator,
    prompt,
    executionResult,
  }: {
    workspaceId: string;
    workflowRunId: string;
    workflow: SeededWorkflow;
    initiator: Initiator;
    prompt: string;
    executionResult: RecordedExecutionResult;
  }): Promise<void> {
    await this.startRun({ workspaceId, workflowRunId, workflow, initiator });

    const recordedConversation =
      await this.workflowAgentConversationService.recordExecution({
        workspaceId,
        workflowRunId,
        stepId: workflow.step.id,
        title: workflow.step.name,
        agentId: null,
        prompt,
        initiatorUserWorkspaceId: null,
        executionResult,
      });

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: workflow.step.id,
      stepInfo: { status: StepStatus.PENDING },
      pendingAsk: recordedConversation?.pendingAsk ?? undefined,
      workflowRunId,
      workspaceId,
    });
  }

  private async seedFormRun({
    workspaceId,
    workflowRunId,
    workflow,
    formStep,
    initiator,
  }: {
    workspaceId: string;
    workflowRunId: string;
    workflow: SeededWorkflow;
    formStep: WorkflowFormAction;
    initiator: Initiator;
  }): Promise<void> {
    await this.startRun({ workspaceId, workflowRunId, workflow, initiator });

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: formStep.id,
      stepInfo: { status: StepStatus.PENDING },
      pendingAsk: {
        name: formStep.name,
        form: { kind: 'formFields', fields: formStep.settings.input },
      },
      workflowRunId,
      workspaceId,
    });
  }

  private buildPausedResult({
    toolCallId,
    toolName,
    input,
    output,
  }: {
    toolCallId: string;
    toolName: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }): RecordedExecutionResult {
    return {
      isPaused: true,
      steps: [
        {
          content: [
            { type: 'tool-call', toolCallId, toolName, input },
            { type: 'tool-result', toolCallId, toolName, input, output },
          ],
        },
      ],
    };
  }

  private async insertWorkflow({
    workspaceId,
    applicationId,
    seedId,
    key,
    name,
    position,
    icon,
    step,
  }: {
    workspaceId: string;
    applicationId: string;
    seedId: (name: string) => string;
    key: string;
    name: string;
    position: number;
    icon: string;
    step: WorkflowAction;
  }): Promise<SeededWorkflow> {
    const workspaceWorkflowId = seedId(`workflow:${key}`);
    const workspaceWorkflowVersionId = seedId(`workflowVersion:${key}`);
    const coreWorkflowId = seedId(`coreWorkflow:${key}`);
    const coreWorkflowVersionId = seedId(`coreWorkflowVersion:${key}`);

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
      universalIdentifier: seedId(`workflowUniversalIdentifier:${key}`),
      applicationId,
      name,
      lastPublishedVersionId: workspaceWorkflowVersionId,
      workspaceWorkflowId,
      lastPublishedCoreWorkflowVersionId: coreWorkflowVersionId,
    });

    await this.coreWorkflowVersionRepository.insert(workspaceId, {
      id: coreWorkflowVersionId,
      universalIdentifier: seedId(`workflowVersionUniversalIdentifier:${key}`),
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
