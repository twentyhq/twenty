import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';

describe('Install application should fail when feature flag is disabled', () => {
  it('should fail with forbidden error when feature flag is disabled', async () => {
    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        workspaceMigration: {
          actions: [
            {
              type: 'delete',
              metadataName: 'fieldMetadata',
              universalIdentifier: '20202020-784f-4042-b58f-ae8dbf718f6e',
            },
          ],
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
