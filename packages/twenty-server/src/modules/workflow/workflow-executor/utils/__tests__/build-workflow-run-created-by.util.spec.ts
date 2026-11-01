import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { buildWorkflowRunCreatedBy } from 'src/modules/workflow/workflow-executor/utils/build-workflow-run-created-by.util';

const CUSTOM_APPLICATION_ID = 'custom-app-id';
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
    workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
  });

describe('buildWorkflowRunCreatedBy', () => {
  it('binds a run of an installed application workflow to that application', () => {
    expect(
      build({ workflowApplicationId: INSTALLED_APPLICATION_ID }).context
        .applicationId,
    ).toBe(INSTALLED_APPLICATION_ID);
    expect(
      build({
        workflowApplicationId: INSTALLED_APPLICATION_ID,
        startingApplicationId: INSTALLED_APPLICATION_ID,
      }).context.applicationId,
    ).toBe(INSTALLED_APPLICATION_ID);
  });

  it('leaves a run of a workspace workflow unbound, whoever starts it', () => {
    expect(
      build({ workflowApplicationId: CUSTOM_APPLICATION_ID }).context
        .applicationId,
    ).toBeUndefined();
    expect(
      build({
        workflowApplicationId: CUSTOM_APPLICATION_ID,
        startingApplicationId: INSTALLED_APPLICATION_ID,
      }).context.applicationId,
    ).toBeUndefined();
  });
});
