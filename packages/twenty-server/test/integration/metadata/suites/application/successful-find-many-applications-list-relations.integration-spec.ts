import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';

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
});
