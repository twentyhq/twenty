import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldActorSource } from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-app-id';

const authContext = {
  workspace: { workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID },
} as WorkspaceAuthContext;

const installedApplication = {
  id: 'installed-app-id',
  name: 'Installed app',
  universalIdentifier: 'installed-app-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
  defaultRoleId: 'installed-app-role-id',
  deletedAt: null,
} as FlatApplication;

const workspaceCustomApplication = {
  id: WORKSPACE_CUSTOM_APPLICATION_ID,
  name: 'Workspace',
  universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
  defaultRoleId: 'workspace-custom-app-role-id',
  deletedAt: null,
} as FlatApplication;

const standardApplication = {
  id: 'twenty-standard-app-id',
  name: 'Standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
  defaultRoleId: 'twenty-standard-app-role-id',
  deletedAt: null,
} as FlatApplication;

const INSTALLED_APPLICATION_WORKFLOW_ID = 'installed-app-workflow-id';
const WORKSPACE_WORKFLOW_ID = 'workspace-workflow-id';

const workflows = [
  {
    id: INSTALLED_APPLICATION_WORKFLOW_ID,
    universalIdentifier: 'installed-app-workflow-universal-identifier',
    applicationId: installedApplication.id,
  },
  {
    id: WORKSPACE_WORKFLOW_ID,
    universalIdentifier: 'workspace-workflow-universal-identifier',
    applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
  },
];

const buildWorkflowRun = ({
  coreWorkflowId,
  stampedApplicationId,
}: {
  coreWorkflowId: string | null;
  stampedApplicationId?: string;
}) =>
  ({
    id: 'workflow-run-id',
    coreWorkflowId,
    createdBy: {
      source: FieldActorSource.WORKFLOW,
      workspaceMemberId: null,
      name: 'Workflow',
      context: { applicationId: stampedApplicationId },
    },
  }) as WorkflowRunWorkspaceEntity;

const buildService = ({
  workflowRun = buildWorkflowRun({ coreWorkflowId: WORKSPACE_WORKFLOW_ID }),
  applications = [installedApplication, workspaceCustomApplication],
}: {
  workflowRun?: WorkflowRunWorkspaceEntity;
  applications?: FlatApplication[];
} = {}) =>
  new WorkflowExecutionContextService(
    {
      getWorkflowRunOrFail: jest.fn().mockResolvedValue(workflowRun),
    } as unknown as WorkflowRunWorkspaceService,
    {} as UserWorkspaceService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatApplicationMaps: {
          byId: Object.fromEntries(
            applications.map((application) => [application.id, application]),
          ),
        },
        flatWorkflowMaps: {
          byUniversalIdentifier: Object.fromEntries(
            workflows.map((workflow) => [
              workflow.universalIdentifier,
              workflow,
            ]),
          ),
          universalIdentifierById: Object.fromEntries(
            workflows.map((workflow) => [
              workflow.id,
              workflow.universalIdentifier,
            ]),
          ),
        },
        userWorkspaceRoleMap: {},
      }),
    } as unknown as WorkspaceCacheService,
    {
      get: jest.fn().mockResolvedValue({
        id: WORKSPACE_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    } as unknown as CoreEntityCacheService,
  );

const runInfo = { workflowRunId: 'workflow-run-id', workspaceId: WORKSPACE_ID };

describe('WorkflowExecutionContextService', () => {
  describe('getExecutionContext', () => {
    it('runs an automated run through the application owning its workflow, with its role', async () => {
      const executionContext = await buildService({
        workflowRun: buildWorkflowRun({
          coreWorkflowId: INSTALLED_APPLICATION_WORKFLOW_ID,
        }),
      }).getExecutionContext(runInfo);

      expect(executionContext.application).toBe(installedApplication);
      expect(executionContext.authContext).toMatchObject({
        type: 'application',
        application: installedApplication,
      });
      expect(executionContext.rolePermissionConfig).toEqual({
        intersectionOf: { applicationRoleId: 'installed-app-role-id' },
      });
    });

    it('takes the application from the workflow of the run, not from the one stamped on it', async () => {
      const executionContext = await buildService({
        workflowRun: buildWorkflowRun({
          coreWorkflowId: INSTALLED_APPLICATION_WORKFLOW_ID,
          stampedApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      }).getExecutionContext(runInfo);

      expect(executionContext.application).toBe(installedApplication);
    });

    it.each([null, 'deleted-workflow-id'])(
      'refuses a run whose workflow no longer exists (workflow: %s)',
      async (coreWorkflowId) => {
        await expect(
          buildService({
            workflowRun: buildWorkflowRun({ coreWorkflowId }),
          }).getExecutionContext(runInfo),
        ).rejects.toThrow('The workflow of this run no longer exists');
      },
    );

    it('refuses a run whose application has no role instead of falling back to another one', async () => {
      await expect(
        buildService({
          workflowRun: buildWorkflowRun({
            coreWorkflowId: WORKSPACE_WORKFLOW_ID,
          }),
          applications: [
            { ...workspaceCustomApplication, defaultRoleId: null },
          ],
        }).getExecutionContext(runInfo),
      ).rejects.toThrow('has no role');
    });
  });

  describe('getFormRecordReadContext', () => {
    it('returns none for a workspace workflow run, so its forms read as before', async () => {
      const workflowRun = buildWorkflowRun({
        coreWorkflowId: WORKSPACE_WORKFLOW_ID,
      });

      expect(
        await buildService({ workflowRun }).getFormRecordReadContext({
          workflowRun,
          workspaceId: WORKSPACE_ID,
        }),
      ).toBeNull();
    });

    it('reads with the permissions of an installed application run', async () => {
      const workflowRun = buildWorkflowRun({
        coreWorkflowId: INSTALLED_APPLICATION_WORKFLOW_ID,
        stampedApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      });

      expect(
        await buildService({ workflowRun }).getFormRecordReadContext({
          workflowRun,
          workspaceId: WORKSPACE_ID,
        }),
      ).toMatchObject({ application: installedApplication });
    });
  });

  describe('assertRunApplicationCanTriggerStepTargetOrThrow', () => {
    const assertTarget = ({
      application,
      targetApplicationId,
    }: {
      application: FlatApplication;
      targetApplicationId: string;
    }) =>
      buildService().assertRunApplicationCanTriggerStepTargetOrThrow({
        executionContext: { application, authContext },
        targetApplicationId,
        targetLabel: 'Logic function "greet"',
      });

    it('lets a run use the functions and agents of its application', () => {
      expect(() =>
        assertTarget({
          application: installedApplication,
          targetApplicationId: 'installed-app-id',
        }),
      ).not.toThrow();
    });

    it('refuses an installed application run crossing into another application', () => {
      expect(() =>
        assertTarget({
          application: installedApplication,
          targetApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toThrow(
        'Logic function "greet" belongs to another application than "Installed app"',
      );
    });

    it('lets a run of the workspace custom application use the functions and agents of another application', () => {
      expect(() =>
        assertTarget({
          application: workspaceCustomApplication,
          targetApplicationId: 'installed-app-id',
        }),
      ).not.toThrow();
    });

    it('refuses a run of the standard application using the functions and agents of another application', () => {
      expect(() =>
        assertTarget({
          application: standardApplication,
          targetApplicationId: 'installed-app-id',
        }),
      ).toThrow(
        'Logic function "greet" belongs to another application than "Standard"',
      );
    });
  });
});
