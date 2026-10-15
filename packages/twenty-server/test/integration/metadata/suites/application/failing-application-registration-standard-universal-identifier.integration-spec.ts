import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { findApplicationRegistrationByUniversalIdentifier } from 'test/integration/metadata/suites/application/utils/find-application-registration-by-universal-identifier.util';
import { syncMarketplaceCatalogFromRegistryPackage } from 'test/integration/metadata/suites/application/utils/sync-marketplace-catalog-from-registry-package.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application/application-registration/application-registration.exception';

jest.setTimeout(120000);

const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIERS = [
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER.toUpperCase(),
];

const expectNoStandardApplicationRegistration = async () => {
  expect(
    await findApplicationRegistrationByUniversalIdentifier({
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
  ).toBeNull();
};

describe('Application registration should refuse the standard application universal identifier', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    // Registration rows only: the shared cleanup util would also delete the
    // workspaces' real standard application rows.
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration"
       WHERE "universalIdentifier" = $1`,
      [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
    );

    jest.useFakeTimers();
  });

  it.each(STANDARD_APPLICATION_UNIVERSAL_IDENTIFIERS)(
    'should refuse createApplicationRegistration with %s',
    async (universalIdentifier) => {
      const response = await makeMetadataApiRequest({
        query: gql`
          mutation CreateApplicationRegistration(
            $input: CreateApplicationRegistrationInput!
          ) {
            createApplicationRegistration(input: $input) {
              applicationRegistration {
                id
              }
            }
          }
        `,
        variables: {
          input: { name: 'Standard application', universalIdentifier },
        },
      });

      expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
        ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      );
      await expectNoStandardApplicationRegistration();
    },
  );

  it.each(STANDARD_APPLICATION_UNIVERSAL_IDENTIFIERS)(
    'should refuse a tarball upload with %s',
    async (universalIdentifier) => {
      const { errors } = await uploadAppTarball({
        tarballBuffer: await createAppTarball({
          'manifest.json': JSON.stringify(
            buildBaseManifest({ appId: universalIdentifier, roleId: uuidv4() }),
          ),
          'package.json': JSON.stringify({
            name: 'test-standard-application-tarball',
            version: '1.0.0',
          }),
        }),
        expectToFail: true,
      });

      expect(errors?.[0]?.extensions?.subCode).toBe(
        ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      );
      await expectNoStandardApplicationRegistration();
    },
  );

  it('should not register a catalog entry with the standard application identifier', async () => {
    await syncMarketplaceCatalogFromRegistryPackage({
      packageName: '@test/standard-application-squatter',
      version: '1.0.0',
      manifest: buildBaseManifest({
        appId: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: uuidv4(),
      }),
    });

    await expectNoStandardApplicationRegistration();
  });
});
