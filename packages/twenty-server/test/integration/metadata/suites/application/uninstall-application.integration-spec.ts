import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';

describe('uninstallApplication', () => {
  it('should fail to uninstall a non-existent application', async () => {
    const { errors } = await uninstallApplication({
      universalIdentifier: '00000000-0000-0000-0000-000000000000',
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
    expect(errors?.[0].message).toContain(
      'Application with universalIdentifier',
    );
  });

  it('should fail to uninstall the Twenty Standard application (not uninstallable)', async () => {
    // Get the Twenty Standard application which is canBeUninstalled = false
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });

    const twentyStandardApp = applicationsData.findManyApplications.find(
      (app) => app.name === 'Twenty Standard',
    );

    expect(twentyStandardApp).toBeDefined();

    const { errors } = await uninstallApplication({
      universalIdentifier: twentyStandardApp!.universalIdentifier,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
    expect(errors?.[0].message).toContain('cannot be uninstalled');
  });
});
