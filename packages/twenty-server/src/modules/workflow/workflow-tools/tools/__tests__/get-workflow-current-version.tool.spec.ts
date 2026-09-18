import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

import { createGetWorkflowCurrentVersionTool } from '../get-workflow-current-version.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const CORE_WORKFLOW_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const ROLE_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';
const CORE_DRAFT_VERSION_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const CORE_ACTIVE_VERSION_ID = '20202020-eeee-4d02-bf25-6aeccf7ea419';

const buildContext = () => ({
  workspaceId: WORKSPACE_ID,
  rolePermissionConfig: { intersectionOf: [ROLE_ID] },
});

const buildDeps = ({
  coreWorkflow,
  coreWorkflowVersions,
}: {
  coreWorkflow: unknown;
  coreWorkflowVersions: { id: string; status: CoreWorkflowVersionStatus }[];
}) => ({
  coreWorkflowListService: {
    findOneById: jest.fn().mockResolvedValue(coreWorkflow),
  },
  coreWorkflowVersionListService: {
    findManyByCoreWorkflowId: jest.fn().mockResolvedValue(coreWorkflowVersions),
    findOneByCoreWorkflowVersionId: jest
      .fn()
      .mockImplementation(async ({ coreWorkflowVersionId }) => ({
        id: coreWorkflowVersionId,
        label: 'v1',
        status: CoreWorkflowVersionStatus.DRAFT,
        trigger: null,
        steps: [],
      })),
  },
});

const buildTool = (deps: ReturnType<typeof buildDeps>) =>
  createGetWorkflowCurrentVersionTool(
    deps as unknown as Pick<
      WorkflowToolDependencies,
      'coreWorkflowListService' | 'coreWorkflowVersionListService'
    >,
    buildContext(),
  );

describe('get_workflow_current_version tool', () => {
  it('should read the definition from core using the core workflow id', async () => {
    const deps = buildDeps({
      coreWorkflow: { id: CORE_WORKFLOW_ID },
      coreWorkflowVersions: [
        {
          id: CORE_DRAFT_VERSION_ID,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      ],
    });

    await buildTool(deps).execute({ coreWorkflowId: CORE_WORKFLOW_ID });

    expect(deps.coreWorkflowListService.findOneById).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowId: CORE_WORKFLOW_ID,
    });
    expect(
      deps.coreWorkflowVersionListService.findManyByCoreWorkflowId,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowId: CORE_WORKFLOW_ID,
    });
  });

  it('should return draft version over active version', async () => {
    const deps = buildDeps({
      coreWorkflow: { id: CORE_WORKFLOW_ID },
      coreWorkflowVersions: [
        {
          id: CORE_ACTIVE_VERSION_ID,
          status: CoreWorkflowVersionStatus.ACTIVE,
        },
        {
          id: CORE_DRAFT_VERSION_ID,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      ],
    });

    const result = await buildTool(deps).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(result.success).toBe(true);

    if (
      !('workflowVersion' in result) ||
      result.workflowVersion === undefined
    ) {
      throw new Error('Expected workflowVersion to be present in the result');
    }

    expect(result.workflowVersion.coreWorkflowVersionId).toBe(
      CORE_DRAFT_VERSION_ID,
    );
    expect(result.workflowVersion.coreWorkflowId).toBe(CORE_WORKFLOW_ID);
  });

  it('should return error when workflow is not found', async () => {
    const deps = buildDeps({ coreWorkflow: null, coreWorkflowVersions: [] });

    const result = await buildTool(deps).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain(CORE_WORKFLOW_ID);
  });

  it('should return error when no draft or active version exists', async () => {
    const deps = buildDeps({
      coreWorkflow: { id: CORE_WORKFLOW_ID },
      coreWorkflowVersions: [],
    });

    const result = await buildTool(deps).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('no draft or active version');
  });
});
