import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type Repository } from 'typeorm';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type RoleService } from 'src/engine/metadata-modules/role/role.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-app-id';

const authContext = {
  workspace: { workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID },
} as WorkspaceAuthContext;

const installedApplication = {
  id: 'installed-app-id',
  name: 'Installed app',
  universalIdentifier: 'installed-app-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
} as FlatApplication;

const workspaceCustomApplication = {
  id: WORKSPACE_CUSTOM_APPLICATION_ID,
  name: 'Workspace',
  universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
} as FlatApplication;

const standardApplication = {
  id: 'twenty-standard-app-id',
  name: 'Standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
} as FlatApplication;

describe('WorkflowExecutionContextService', () => {
  const workflowExecutionContextService = new WorkflowExecutionContextService(
    {} as WorkflowRunWorkspaceService,
    {} as UserWorkspaceService,
    {} as ApplicationService,
    {} as RoleService,
    {} as WorkspaceCacheService,
    {} as Repository<WorkspaceEntity>,
  );

  describe('assertRunApplicationCanTriggerStepTargetOrThrow', () => {
    const assertTarget = ({
      application,
      targetApplicationId,
    }: {
      application: FlatApplication | null;
      targetApplicationId: string;
    }) =>
      workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow(
        {
          executionContext: { application, authContext },
          targetApplicationId,
          targetLabel: 'Logic function "greet"',
        },
      );

    it('lets a run without an application use any function or agent', () => {
      expect(() =>
        assertTarget({
          application: null,
          targetApplicationId: 'other-app-id',
        }),
      ).not.toThrow();
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
