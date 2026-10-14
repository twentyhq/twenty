import { assertStepTargetBelongsToRunApplication } from 'src/modules/workflow/workflow-executor/utils/assert-step-target-belongs-to-run-application.util';

const RUN_APPLICATION = { id: 'installed-app-id', name: 'Installed app' };

const assertTarget = (targetApplicationId: string) =>
  assertStepTargetBelongsToRunApplication({
    application: RUN_APPLICATION,
    targetApplicationId,
    targetLabel: 'Logic function "greet"',
  });

describe('assertStepTargetBelongsToRunApplication', () => {
  it('lets a run use the functions and agents of its application', () => {
    expect(() => assertTarget('installed-app-id')).not.toThrow();
  });

  it('refuses a run using the functions and agents of the workspace', () => {
    expect(() => assertTarget('workspace-custom-app-id')).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
  });

  it('refuses a run crossing into another application', () => {
    expect(() => assertTarget('twenty-standard-app-id')).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
    expect(() => assertTarget('other-app-id')).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
  });
});
