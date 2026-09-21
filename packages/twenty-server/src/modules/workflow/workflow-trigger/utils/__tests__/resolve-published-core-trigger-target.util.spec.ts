import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { resolvePublishedCoreTriggerTarget } from 'src/modules/workflow/workflow-trigger/utils/resolve-published-core-trigger-target.util';

const workflow = {
  id: 'core-workflow-1',
  workspaceWorkflowId: 'workspace-workflow-1',
  lastPublishedCoreWorkflowVersionId: 'core-version-1',
};

const cronTrigger = {
  type: WorkflowTriggerType.CRON,
  settings: { type: 'CUSTOM', pattern: '0 * * * *' },
} as never;

const publishedVersion = {
  id: 'core-version-1',
  coreWorkflowId: 'core-workflow-1',
  status: WorkflowVersionStatus.ACTIVE,
  workspaceWorkflowVersionId: 'workspace-version-1',
  triggers: [cronTrigger],
};

describe('resolvePublishedCoreTriggerTarget', () => {
  it('resolves the published version and its dispatch ids', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow,
        publishedVersion,
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({
      status: 'RESOLVED',
      workflowId: 'core-workflow-1',
      legacyWorkflowId: 'workspace-workflow-1',
      definition: cronTrigger,
      coreWorkflowVersionId: 'core-version-1',
      workspaceWorkflowVersionId: 'workspace-version-1',
    });
  });

  it('reports a missing workflow as unresolvable', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow: null,
        publishedVersion,
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({ status: 'UNRESOLVABLE', reason: 'workflow-not-found' });
  });

  it('reports a workflow without a published version as unresolvable', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow: { ...workflow, lastPublishedCoreWorkflowVersionId: null },
        publishedVersion,
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({ status: 'UNRESOLVABLE', reason: 'no-published-version' });
  });

  it('reports a dangling published pointer as unresolvable', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow,
        publishedVersion: null,
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({
      status: 'UNRESOLVABLE',
      reason: 'published-version-not-found',
    });
  });

  it('is not applicable when the published version belongs to another workflow', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow,
        publishedVersion: {
          ...publishedVersion,
          coreWorkflowId: 'core-workflow-2',
        },
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({ status: 'NOT_APPLICABLE' });
  });

  it('is not applicable when the published version is no longer active', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow,
        publishedVersion: {
          ...publishedVersion,
          status: WorkflowVersionStatus.DEACTIVATED,
        },
        expectedTriggerType: WorkflowTriggerType.CRON,
      }),
    ).toEqual({ status: 'NOT_APPLICABLE' });
  });

  it('is not applicable when the published version carries another trigger type', () => {
    expect(
      resolvePublishedCoreTriggerTarget({
        workflow,
        publishedVersion,
        expectedTriggerType: WorkflowTriggerType.DATABASE_EVENT,
      }),
    ).toEqual({ status: 'NOT_APPLICABLE' });
  });
});
