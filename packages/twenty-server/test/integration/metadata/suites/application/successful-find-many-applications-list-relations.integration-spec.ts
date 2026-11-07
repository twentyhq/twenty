import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('findManyApplications with list relations should succeed', () => {
  let application: ApplicationWithVariable;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Listed Application',
      variableKey: 'LISTED_APPLICATION_VARIABLE',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should return the variables of each application', async () => {
    const { data } = await findManyApplications({
      gqlFields: `
        id
        applicationVariables {
          key
          value
        }
      `,
      expectToFail: false,
    });

    const listedApplication = data.findManyApplications.find(
      ({ id }) => id === application.id,
    );

    expect(listedApplication?.applicationVariables).toEqual([
      { key: application.variableKey, value: 'initial' },
    ]);
  });

  it('should return every list relation of each application', async () => {
    const { data, errors } = await findManyApplications({
      gqlFields: `
        id
        agents { id }
        frontComponents { id }
        commandMenuItems { id }
        settingsMenuItems { id }
        logicFunctions { id }
        objects { id }
        applicationVariables { key }
      `,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    for (const listedApplication of data.findManyApplications) {
      expect(listedApplication.agents).toEqual(expect.any(Array));
      expect(listedApplication.frontComponents).toEqual(expect.any(Array));
      expect(listedApplication.commandMenuItems).toEqual(expect.any(Array));
      expect(listedApplication.settingsMenuItems).toEqual(expect.any(Array));
      expect(listedApplication.logicFunctions).toEqual(expect.any(Array));
      expect(listedApplication.objects).toEqual(expect.any(Array));
      expect(listedApplication.applicationVariables).toEqual(expect.any(Array));
    }
  });
  it("should not show other applications' lists to an application token", async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    const { data, errors } = await findManyApplications({
      gqlFields: `
        id
        agents { id }
        frontComponents { id }
        commandMenuItems { id }
        settingsMenuItems { id }
        logicFunctions { id }
        objects { id }
      `,
      accessToken: applicationAccessToken.token,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const otherApplications = data.findManyApplications.filter(
      ({ id }) => id !== application.id,
    );

    expect(otherApplications.length).toBeGreaterThan(0);

    for (const otherApplication of otherApplications) {
      expect(otherApplication).toEqual({
        id: otherApplication.id,
        agents: [],
        frontComponents: [],
        commandMenuItems: [],
        settingsMenuItems: [],
        logicFunctions: [],
        objects: [],
      });
    }
  });
});
