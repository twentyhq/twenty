import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { type EntityManager } from 'typeorm';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  AGENT_WORKFLOW_DATA_SEED_IDS,
  AGENT_WORKFLOW_SEED_NAME,
  AGENT_WORKFLOW_SEED_PROMPT,
  AGENT_WORKFLOW_SEED_STEP_NAME,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

type SeedAgentWorkflowArgs = {
  entityManager: EntityManager;
  schemaName: string;
  workspaceId: string;
};

const {
  LEAD_QUALIFICATION_WORKFLOW,
  LEAD_QUALIFICATION_WORKFLOW_VERSION,
  LEAD_QUALIFICATION_CORE_WORKFLOW,
  LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
  LEAD_QUALIFICATION_WORKFLOW_UNIVERSAL_IDENTIFIER,
  LEAD_QUALIFICATION_WORKFLOW_VERSION_UNIVERSAL_IDENTIFIER,
  QUALIFY_LEAD_STEP,
  COMPLETED_RUN,
  WAITING_RUN,
} = AGENT_WORKFLOW_DATA_SEED_IDS;

const trigger = {
  name: 'Launch manually',
  type: 'MANUAL',
  settings: {
    outputSchema: {},
    icon: 'IconUserPlus',
    availability: { type: 'GLOBAL', locations: undefined },
  },
  nextStepIds: [QUALIFY_LEAD_STEP],
};

const steps = [
  {
    id: QUALIFY_LEAD_STEP,
    name: AGENT_WORKFLOW_SEED_STEP_NAME,
    type: 'AI_AGENT',
    valid: true,
    settings: {
      input: { prompt: AGENT_WORKFLOW_SEED_PROMPT },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
    __typename: 'WorkflowAction',
    nextStepIds: null,
  },
];

const actorColumns = {
  createdBySource: FieldActorSource.MANUAL,
  createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  createdByName: 'Tim Apple',
  createdByContext: {},
  updatedBySource: FieldActorSource.MANUAL,
  updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  updatedByName: 'Tim Apple',
  updatedByContext: {},
};

// A workflow whose only step is an AI agent, plus two runs of it: one that
// completed and one waiting on the question the agent asked. Their
// conversations are seeded with the chat threads.
export const seedAgentWorkflow = async ({
  entityManager,
  schemaName,
  workspaceId,
}: SeedAgentWorkflowArgs) => {
  const [workspace] = await entityManager.query(
    `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
    [workspaceId],
  );
  const applicationId = workspace?.workspaceCustomApplicationId;

  if (!isDefined(applicationId)) {
    throw new Error(
      `Workspace custom application not found for workspace ${workspaceId}`,
    );
  }

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
      'updatedByContext',
      'coreWorkflowId',
    ])
    .orIgnore()
    .values([
      {
        id: LEAD_QUALIFICATION_WORKFLOW,
        name: AGENT_WORKFLOW_SEED_NAME,
        lastPublishedVersionId: LEAD_QUALIFICATION_WORKFLOW_VERSION,
        statuses: ['ACTIVE'],
        position: 3,
        ...actorColumns,
        coreWorkflowId: LEAD_QUALIFICATION_CORE_WORKFLOW,
      },
    ])
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(WorkflowEntity)
    .orIgnore()
    .values([
      {
        id: LEAD_QUALIFICATION_CORE_WORKFLOW,
        workspaceId,
        universalIdentifier: LEAD_QUALIFICATION_WORKFLOW_UNIVERSAL_IDENTIFIER,
        applicationId,
        name: AGENT_WORKFLOW_SEED_NAME,
        lastPublishedVersionId: LEAD_QUALIFICATION_WORKFLOW_VERSION,
        workspaceWorkflowId: LEAD_QUALIFICATION_WORKFLOW,
        lastPublishedCoreWorkflowVersionId:
          LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
      },
    ])
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
    .values([
      {
        id: LEAD_QUALIFICATION_WORKFLOW_VERSION,
        name: 'v1',
        trigger: JSON.stringify(trigger),
        steps: JSON.stringify(steps),
        status: 'ACTIVE',
        position: 3,
        workflowId: LEAD_QUALIFICATION_WORKFLOW,
        coreWorkflowVersionId: LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
      },
    ])
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
    ])
    .orIgnore()
    .values([
      {
        id: LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
        workspaceId,
        universalIdentifier:
          LEAD_QUALIFICATION_WORKFLOW_VERSION_UNIVERSAL_IDENTIFIER,
        applicationId,
        triggers: [trigger],
        steps,
        status: 'ACTIVE',
        workflowId: LEAD_QUALIFICATION_WORKFLOW,
        coreWorkflowId: LEAD_QUALIFICATION_CORE_WORKFLOW,
      },
    ])
    .execute();

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflowRun`, [
      'id',
      'name',
      'status',
      'state',
      'position',
      'workflowId',
      'workflowVersionId',
      'coreWorkflowId',
      'coreWorkflowVersionId',
      'enqueuedAt',
      'startedAt',
      'endedAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'createdByContext',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
      'updatedByContext',
    ])
    .orIgnore()
    .values([
      {
        id: COMPLETED_RUN,
        name: `#1 - ${AGENT_WORKFLOW_SEED_NAME}`,
        status: WorkflowRunStatus.COMPLETED,
        state: JSON.stringify({
          flow: { trigger, steps },
          stepInfos: {
            trigger: { status: StepStatus.SUCCESS, result: {} },
            [QUALIFY_LEAD_STEP]: {
              status: StepStatus.SUCCESS,
              result: {
                response:
                  'Warm lead: VP Sales at a 200-person SaaS company in our target segment. ' +
                  'Outreach email drafted and sent after approval.',
              },
            },
          },
        }),
        position: 1,
        workflowId: LEAD_QUALIFICATION_WORKFLOW,
        workflowVersionId: LEAD_QUALIFICATION_WORKFLOW_VERSION,
        coreWorkflowId: LEAD_QUALIFICATION_CORE_WORKFLOW,
        coreWorkflowVersionId: LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
        enqueuedAt: yesterday,
        startedAt: yesterday,
        endedAt: yesterday,
        ...actorColumns,
      },
      {
        id: WAITING_RUN,
        name: `#2 - ${AGENT_WORKFLOW_SEED_NAME}`,
        status: WorkflowRunStatus.RUNNING,
        state: JSON.stringify({
          flow: { trigger, steps },
          stepInfos: {
            trigger: { status: StepStatus.SUCCESS, result: {} },
            [QUALIFY_LEAD_STEP]: { status: StepStatus.PENDING },
          },
        }),
        position: 2,
        workflowId: LEAD_QUALIFICATION_WORKFLOW,
        workflowVersionId: LEAD_QUALIFICATION_WORKFLOW_VERSION,
        coreWorkflowId: LEAD_QUALIFICATION_CORE_WORKFLOW,
        coreWorkflowVersionId: LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION,
        enqueuedAt: oneHourAgo,
        startedAt: oneHourAgo,
        endedAt: null,
        ...actorColumns,
      },
    ])
    .execute();
};
