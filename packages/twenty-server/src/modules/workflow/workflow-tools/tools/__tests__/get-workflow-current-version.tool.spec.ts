import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { buildWorkflowToolExecutor } from 'src/modules/workflow/workflow-tools/tools/__tests__/workflow-tool-executor.test-util';
import { GetWorkflowCurrentVersionTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-current-version.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const CORE_WORKFLOW_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const CORE_DRAFT_VERSION_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const CORE_ACTIVE_VERSION_ID = '20202020-eeee-4d02-bf25-6aeccf7ea419';
const WORKSPACE_CUSTOM_APPLICATION_ID = '20202020-ffff-4d02-bf25-6aeccf7ea419';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: {
    id: WORKSPACE_ID,
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
  },
} as WorkspaceAuthContext;
const INSTALLED_APPLICATION = {
  id: '20202020-cccc-4d02-bf25-6aeccf7ea419',
  sourceType: ApplicationRegistrationSourceType.NPM,
} as FlatApplication;

const buildContext = (application?: FlatApplication) => ({
  workspaceId: WORKSPACE_ID,
  authContext: AUTH_CONTEXT,
  application,
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

const buildTool = (
  deps: ReturnType<typeof buildDeps>,
  application?: FlatApplication,
) =>
  buildWorkflowToolExecutor(
    new GetWorkflowCurrentVersionTool(
      deps.coreWorkflowListService as never,
      deps.coreWorkflowVersionListService as never,
    ),
    buildContext(application),
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
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      coreWorkflowId: CORE_WORKFLOW_ID,
    });
    expect(
      deps.coreWorkflowVersionListService.findManyByCoreWorkflowId,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      coreWorkflowId: CORE_WORKFLOW_ID,
    });
  });

  it('should read as the calling application', async () => {
    const deps = buildDeps({
      coreWorkflow: { id: CORE_WORKFLOW_ID },
      coreWorkflowVersions: [
        {
          id: CORE_DRAFT_VERSION_ID,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      ],
    });
    const readCaller = {
      callerApplication: INSTALLED_APPLICATION,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    };

    await buildTool(deps, INSTALLED_APPLICATION).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(deps.coreWorkflowListService.findOneById).toHaveBeenCalledWith(
      expect.objectContaining(readCaller),
    );
    expect(
      deps.coreWorkflowVersionListService.findManyByCoreWorkflowId,
    ).toHaveBeenCalledWith(expect.objectContaining(readCaller));
    expect(
      deps.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId,
    ).toHaveBeenCalledWith(expect.objectContaining(readCaller));
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

    expect(result).toMatchObject({
      success: true,
      result: {
        coreWorkflowVersionId: CORE_DRAFT_VERSION_ID,
        coreWorkflowId: CORE_WORKFLOW_ID,
      },
    });
  });

  it('should return error when workflow is not found', async () => {
    const deps = buildDeps({ coreWorkflow: null, coreWorkflowVersions: [] });

    const result = await buildTool(deps).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain(CORE_WORKFLOW_ID);
  });

  it('should return error when no draft, active or deactivated version exists', async () => {
    const deps = buildDeps({
      coreWorkflow: { id: CORE_WORKFLOW_ID },
      coreWorkflowVersions: [],
    });

    const result = await buildTool(deps).execute({
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('no draft, active or deactivated version');
  });
});
