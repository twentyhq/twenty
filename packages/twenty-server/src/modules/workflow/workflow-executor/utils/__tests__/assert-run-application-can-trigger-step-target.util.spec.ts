import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { assertRunApplicationCanTriggerStepTarget } from 'src/modules/workflow/workflow-executor/utils/assert-run-application-can-trigger-step-target.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-app-id';

const INSTALLED_APPLICATION = {
  id: 'installed-app-id',
  name: 'Installed app',
  universalIdentifier: 'installed-app-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
};

const assertTarget = ({
  application = INSTALLED_APPLICATION,
  targetApplicationId,
}: {
  application?: Parameters<
    typeof assertRunApplicationCanTriggerStepTarget
  >[0]['application'];
  targetApplicationId: string;
}) =>
  assertRunApplicationCanTriggerStepTarget({
    application,
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    targetApplicationId,
    targetLabel: 'Logic function "greet"',
  });

describe('assertRunApplicationCanTriggerStepTarget', () => {
  it('lets a run use the functions and agents of its application', () => {
    expect(() =>
      assertTarget({ targetApplicationId: 'installed-app-id' }),
    ).not.toThrow();
  });

  it('refuses an installed application run using the functions and agents of the workspace', () => {
    expect(() =>
      assertTarget({ targetApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID }),
    ).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
  });

  it('refuses an installed application run crossing into another application', () => {
    expect(() =>
      assertTarget({ targetApplicationId: 'twenty-standard-app-id' }),
    ).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
    expect(() => assertTarget({ targetApplicationId: 'other-app-id' })).toThrow(
      'Logic function "greet" belongs to another application than "Installed app"',
    );
  });

  it.each([
    {
      label: 'the workspace custom application',
      application: {
        id: WORKSPACE_CUSTOM_APPLICATION_ID,
        name: 'Workspace',
        universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      },
    },
    {
      label: 'the standard application',
      application: {
        id: 'twenty-standard-app-id',
        name: 'Standard',
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      },
    },
  ])(
    'lets a run of $label use the functions and agents of another application',
    ({ application }) => {
      expect(() =>
        assertTarget({ application, targetApplicationId: 'installed-app-id' }),
      ).not.toThrow();
    },
  );
});
