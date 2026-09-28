import { assertStepTargetBelongsToOwningApplication } from 'src/modules/workflow/workflow-executor/utils/assert-step-target-belongs-to-owning-application.util';

const OWNING_APPLICATION = { id: 'installed-app-id', name: 'Installed app' };

describe('assertStepTargetBelongsToOwningApplication', () => {
  it('lets workspace workflows use functions and agents of any application', () => {
    expect(() =>
      assertStepTargetBelongsToOwningApplication({
        owningApplication: null,
        targetApplicationId: 'other-app-id',
        targetLabel: 'Logic function "greet"',
      }),
    ).not.toThrow();
  });

  it('lets an application workflow use its own functions and agents', () => {
    expect(() =>
      assertStepTargetBelongsToOwningApplication({
        owningApplication: OWNING_APPLICATION,
        targetApplicationId: 'installed-app-id',
        targetLabel: 'Logic function "greet"',
      }),
    ).not.toThrow();
  });

  it('refuses an application workflow crossing into another application', () => {
    expect(() =>
      assertStepTargetBelongsToOwningApplication({
        owningApplication: OWNING_APPLICATION,
        targetApplicationId: 'workspace-custom-app-id',
        targetLabel: 'Logic function "admin script"',
      }),
    ).toThrow(
      'Logic function "admin script" does not belong to application "Installed app"',
    );
  });
});
