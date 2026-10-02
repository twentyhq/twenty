import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { buildWorkflowRunCreatedBy } from 'src/modules/workflow/workflow-executor/utils/build-workflow-run-created-by.util';

const CUSTOM_APPLICATION_ID = 'custom-app-id';
const STANDARD_APPLICATION_ID = 'standard-app-id';
const INSTALLED_APPLICATION_ID = 'installed-app-id';

const buildSource = (applicationId?: string): ActorMetadata => ({
  source: FieldActorSource.MANUAL,
  workspaceMemberId: 'member-id',
  name: 'Tim Apple',
  context: { applicationId },
});

const build = ({
  workflowApplicationId,
  startingApplicationId,
}: {
  workflowApplicationId: string;
  startingApplicationId?: string;
}) =>
  buildWorkflowRunCreatedBy({
    source: buildSource(startingApplicationId),
    workflowApplicationId,
    workspaceOwnedApplicationIds: [
      CUSTOM_APPLICATION_ID,
      STANDARD_APPLICATION_ID,
    ],
  });

describe('buildWorkflowRunCreatedBy', () => {
  it('binds a run of an installed application workflow to that application', () => {
    expect(
      build({ workflowApplicationId: INSTALLED_APPLICATION_ID }).context
        .applicationId,
    ).toBe(INSTALLED_APPLICATION_ID);
  });

  it('keeps the application that started its own workflow', () => {
    expect(
      build({
        workflowApplicationId: INSTALLED_APPLICATION_ID,
        startingApplicationId: INSTALLED_APPLICATION_ID,
      }).context.applicationId,
    ).toBe(INSTALLED_APPLICATION_ID);
  });

  it('binds a workspace workflow started by an application token to that application', () => {
    expect(
      build({
        workflowApplicationId: CUSTOM_APPLICATION_ID,
        startingApplicationId: INSTALLED_APPLICATION_ID,
      }).context.applicationId,
    ).toBe(INSTALLED_APPLICATION_ID);
  });

  it('leaves a workspace workflow started without an application unbound', () => {
    expect(
      build({ workflowApplicationId: STANDARD_APPLICATION_ID }).context
        .applicationId,
    ).toBeUndefined();
  });

  it('never binds a run to a workspace-owned application', () => {
    expect(
      build({
        workflowApplicationId: CUSTOM_APPLICATION_ID,
        startingApplicationId: STANDARD_APPLICATION_ID,
      }).context.applicationId,
    ).toBeUndefined();
  });
});
