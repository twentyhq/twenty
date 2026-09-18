import { randomUUID } from 'node:crypto';

import request from 'supertest';

const TEST_WORKSPACE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

const baseUrl = `http://localhost:${APP_PORT}`;

const postMcp = (body: Record<string, unknown>) =>
  request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callWorkflowTool = async <TResult>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  const response = await postMcp({
    jsonrpc: '2.0',
    method: 'tools/call',
    id: `call-${randomUUID()}`,
    params: {
      name: 'execute_tool',
      arguments: { toolName, arguments: args },
    },
  }).expect(200);

  expect(response.body.error).toBeUndefined();

  const result = response.body.result as McpToolCallResult;
  const raw = result.content?.[0]?.text;

  expect(raw).toBeDefined();

  return JSON.parse(raw as string) as TResult;
};

const TRIGGER_ID = 'trigger';

const buildManualTrigger = () => ({
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
});

const buildIteratorStep = (id: string) => ({
  id,
  name: 'Loop over items',
  type: 'ITERATOR',
  valid: true,
  settings: {
    input: { items: ['a', 'b'] },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: [],
});

const buildCodeFreeStep = (id: string, name: string) => ({
  id,
  name,
  type: 'CREATE_RECORD',
  valid: true,
  settings: {
    input: {
      objectName: 'company',
      objectRecord: { name: `${name} ${randomUUID()}` },
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: [],
});

const readCoreWorkflowRow = async (coreWorkflowId: string) => {
  const rows = await global.testDataSource.query(
    `SELECT id, "workspaceWorkflowId" FROM core."workflow" WHERE id = $1`,
    [coreWorkflowId],
  );

  return rows[0] as { id: string; workspaceWorkflowId: string | null };
};

const readCoreVersionRow = async (coreWorkflowVersionId: string) => {
  const rows = await global.testDataSource.query(
    `SELECT id, "workspaceWorkflowVersionId", steps, triggers, status
     FROM core."workflowVersion" WHERE id = $1`,
    [coreWorkflowVersionId],
  );

  return rows[0] as {
    id: string;
    workspaceWorkflowVersionId: string | null;
    steps: unknown[] | null;
    triggers: unknown[] | null;
    status: string;
  };
};

const readWorkspaceVersionRow = async (workspaceWorkflowVersionId: string) => {
  const rows = await global.testDataSource.query(
    `SELECT id, steps, trigger FROM "${TEST_WORKSPACE_SCHEMA}"."workflowVersion" WHERE id = $1`,
    [workspaceWorkflowVersionId],
  );

  return rows[0] as {
    id: string;
    steps: { id: string; name: string }[] | null;
    trigger: { type: string } | null;
  };
};

describe('workflow MCP tools on core identities (integration)', () => {
  const coreWorkflowIdsToDelete: string[] = [];

  afterAll(async () => {
    for (const coreWorkflowId of coreWorkflowIdsToDelete) {
      await callWorkflowTool('delete_workflow', { coreWorkflowId });
    }
  });

  describe('create → inspect → edit → validate → activate', () => {
    const iteratorStepId = randomUUID();
    const loopBodyStepId = randomUUID();
    const afterLoopStepId = randomUUID();
    const workflowName = `MCP core workflow ${randomUUID()}`;

    let coreWorkflowId: string;
    let coreWorkflowVersionId: string;

    it('should create a complete workflow and return core identifiers', async () => {
      const created = await callWorkflowTool<{
        success: boolean;
        result: { coreWorkflowId: string; coreWorkflowVersionId: string };
      }>('create_complete_workflow', {
        name: workflowName,
        trigger: buildManualTrigger(),
        steps: [
          buildIteratorStep(iteratorStepId),
          buildCodeFreeStep(loopBodyStepId, 'Inside loop'),
          buildCodeFreeStep(afterLoopStepId, 'After loop'),
        ],
        edges: [
          { source: TRIGGER_ID, target: iteratorStepId },
          {
            source: iteratorStepId,
            target: loopBodyStepId,
            sourceConnectionOptions: {
              connectedStepType: 'ITERATOR',
              settings: { isConnectedToLoop: true },
            },
          },
          { source: loopBodyStepId, target: iteratorStepId },
          { source: iteratorStepId, target: afterLoopStepId },
        ],
      });

      expect(created.success).toBe(true);

      coreWorkflowId = created.result.coreWorkflowId;
      coreWorkflowVersionId = created.result.coreWorkflowVersionId;

      coreWorkflowIdsToDelete.push(coreWorkflowId);

      expect(coreWorkflowId).toBeDefined();
      expect(coreWorkflowVersionId).toBeDefined();
    });

    it('should key the returned identifiers on core rows whose ids differ from the workspace mirrors', async () => {
      const coreWorkflow = await readCoreWorkflowRow(coreWorkflowId);
      const coreVersion = await readCoreVersionRow(coreWorkflowVersionId);

      expect(coreWorkflow.workspaceWorkflowId).toBeDefined();
      expect(coreWorkflow.workspaceWorkflowId).not.toBe(coreWorkflowId);
      expect(coreVersion.workspaceWorkflowVersionId).toBeDefined();
      expect(coreVersion.workspaceWorkflowVersionId).not.toBe(
        coreWorkflowVersionId,
      );
    });

    it('should preserve the iterator loop connection and the step after the loop', async () => {
      const coreVersion = await readCoreVersionRow(coreWorkflowVersionId);
      const steps = (coreVersion.steps ?? []) as {
        id: string;
        type: string;
        nextStepIds?: string[];
        settings?: { input?: { initialLoopStepIds?: string[] } };
      }[];

      const iteratorStep = steps.find((step) => step.id === iteratorStepId);
      const loopBodyStep = steps.find((step) => step.id === loopBodyStepId);

      expect(iteratorStep?.settings?.input?.initialLoopStepIds).toEqual([
        loopBodyStepId,
      ]);
      expect(iteratorStep?.nextStepIds).toEqual([afterLoopStepId]);
      expect(loopBodyStep?.nextStepIds).toEqual([iteratorStepId]);
    });

    it('should read the current version back by core workflow id', async () => {
      const current = await callWorkflowTool<{
        success: boolean;
        workflowVersion: {
          coreWorkflowVersionId: string;
          coreWorkflowId: string;
          steps: { id: string }[];
        };
      }>('get_workflow_current_version', { coreWorkflowId });

      expect(current.success).toBe(true);
      expect(current.workflowVersion.coreWorkflowVersionId).toBe(
        coreWorkflowVersionId,
      );
      expect(current.workflowVersion.coreWorkflowId).toBe(coreWorkflowId);
      expect(current.workflowVersion.steps.map(({ id }) => id)).toEqual(
        expect.arrayContaining([iteratorStepId, loopBodyStepId]),
      );
    });

    it('should list the workflow by its core id', async () => {
      const listed = await callWorkflowTool<{
        success: boolean;
        workflows: { coreWorkflowId: string; name: string }[];
      }>('list_workflows', { limit: 100 });

      expect(listed.success).toBe(true);
      expect(
        listed.workflows.some(
          (workflow) => workflow.coreWorkflowId === coreWorkflowId,
        ),
      ).toBe(true);
    });

    it('should write an edit through the shared writer so the rollback mirror follows', async () => {
      const renamedStepName = `Renamed ${randomUUID()}`;
      const coreVersion = await readCoreVersionRow(coreWorkflowVersionId);
      const stepToUpdate = (
        coreVersion.steps as { id: string; name: string }[]
      ).find((step) => step.id === loopBodyStepId);

      await callWorkflowTool('update_workflow_version_step', {
        coreWorkflowVersionId,
        step: { ...stepToUpdate, name: renamedStepName },
      });

      const updatedCoreVersion = await readCoreVersionRow(
        coreWorkflowVersionId,
      );
      const mirrorVersion = await readWorkspaceVersionRow(
        updatedCoreVersion.workspaceWorkflowVersionId as string,
      );

      expect(
        (updatedCoreVersion.steps as { id: string; name: string }[]).find(
          (step) => step.id === loopBodyStepId,
        )?.name,
      ).toBe(renamedStepName);
      expect(
        mirrorVersion.steps?.find((step) => step.id === loopBodyStepId)?.name,
      ).toBe(renamedStepName);
    });

    it('should read core content even after the workspace mirror content diverges', async () => {
      const coreVersion = await readCoreVersionRow(coreWorkflowVersionId);

      await global.testDataSource.query(
        `UPDATE "${TEST_WORKSPACE_SCHEMA}"."workflowVersion"
         SET steps = '[]'::jsonb WHERE id = $1`,
        [coreVersion.workspaceWorkflowVersionId],
      );

      const current = await callWorkflowTool<{
        success: boolean;
        workflowVersion: { steps: { id: string }[] };
      }>('get_workflow_current_version', { coreWorkflowId });

      expect(current.success).toBe(true);
      expect(current.workflowVersion.steps).toHaveLength(3);
    });

    it('should validate and activate using the core version id', async () => {
      const validated = await callWorkflowTool<{
        success: boolean;
        issues?: unknown[];
      }>('validate_workflow', { coreWorkflowVersionId });

      expect(validated).toMatchObject({ success: true });

      await callWorkflowTool('activate_workflow_version', {
        coreWorkflowVersionId,
      });

      const activatedCoreVersion = await readCoreVersionRow(
        coreWorkflowVersionId,
      );

      expect(activatedCoreVersion.status).toBe('ACTIVE');
    });

    it('should filter runs by core workflow id', async () => {
      const runs = await callWorkflowTool<{
        success: boolean;
        workflowRuns: { coreWorkflowId: string }[];
      }>('list_workflow_runs', { coreWorkflowId });

      expect(runs.success).toBe(true);
      expect(
        runs.workflowRuns.every((run) => run.coreWorkflowId === coreWorkflowId),
      ).toBe(true);
    });
  });

  describe('reads without a workspace definition mirror', () => {
    let coreWorkflowId: string;
    let coreWorkflowVersionId: string;

    beforeAll(async () => {
      const created = await callWorkflowTool<{
        result: { coreWorkflowId: string; coreWorkflowVersionId: string };
      }>('create_complete_workflow', {
        name: `Mirrorless core workflow ${randomUUID()}`,
        trigger: buildManualTrigger(),
        steps: [buildCodeFreeStep(randomUUID(), 'Only step')],
        edges: [],
      });

      coreWorkflowId = created.result.coreWorkflowId;
      coreWorkflowVersionId = created.result.coreWorkflowVersionId;
      coreWorkflowIdsToDelete.push(coreWorkflowId);

      const coreVersion = await readCoreVersionRow(coreWorkflowVersionId);
      const coreWorkflow = await readCoreWorkflowRow(coreWorkflowId);

      await global.testDataSource.query(
        `DELETE FROM "${TEST_WORKSPACE_SCHEMA}"."workflowVersion" WHERE id = $1`,
        [coreVersion.workspaceWorkflowVersionId],
      );
      await global.testDataSource.query(
        `DELETE FROM "${TEST_WORKSPACE_SCHEMA}"."workflow" WHERE id = $1`,
        [coreWorkflow.workspaceWorkflowId],
      );
    });

    it('should still return the definition from core', async () => {
      const current = await callWorkflowTool<{
        success: boolean;
        workflowVersion: { coreWorkflowVersionId: string };
      }>('get_workflow_current_version', { coreWorkflowId });

      expect(current.success).toBe(true);
      expect(current.workflowVersion.coreWorkflowVersionId).toBe(
        coreWorkflowVersionId,
      );
    });

    it('should still list the workflow', async () => {
      const listed = await callWorkflowTool<{
        workflows: { coreWorkflowId: string }[];
      }>('list_workflows', { limit: 100 });

      expect(
        listed.workflows.some(
          (workflow) => workflow.coreWorkflowId === coreWorkflowId,
        ),
      ).toBe(true);
    });
  });

  describe('deletion', () => {
    it('should report a missing core workflow instead of reporting a deletion', async () => {
      const result = await callWorkflowTool<{
        success: boolean;
        error?: string;
      }>('delete_workflow', { coreWorkflowId: randomUUID() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found');
    });

    it('should delete a workflow by its core id', async () => {
      const created = await callWorkflowTool<{
        result: { coreWorkflowId: string };
      }>('create_complete_workflow', {
        name: `Deletable core workflow ${randomUUID()}`,
        trigger: buildManualTrigger(),
        steps: [buildCodeFreeStep(randomUUID(), 'Only step')],
        edges: [],
      });

      const result = await callWorkflowTool<{
        success: boolean;
        coreWorkflowId: string;
      }>('delete_workflow', {
        coreWorkflowId: created.result.coreWorkflowId,
      });

      expect(result.success).toBe(true);

      const remaining = await global.testDataSource.query(
        `SELECT id FROM core."workflow" WHERE id = $1`,
        [created.result.coreWorkflowId],
      );

      expect(remaining).toHaveLength(0);
    });
  });
});
