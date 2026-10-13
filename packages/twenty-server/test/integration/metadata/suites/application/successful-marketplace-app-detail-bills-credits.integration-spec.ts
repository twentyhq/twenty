import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type ApplicationBilling } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(120000);

const FIND_MARKETPLACE_APP_DETAIL = gql`
  query FindMarketplaceAppDetail($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      billsCredits
    }
  }
`;

describe('Marketplace app detail billsCredits', () => {
  const uploadedUniversalIdentifiers: string[] = [];

  const uploadApp = async (billing?: ApplicationBilling) => {
    const universalIdentifier = uuidv4();
    const baseManifest = buildBaseManifest({
      appId: universalIdentifier,
      roleId: uuidv4(),
    });

    const tarball = await createAppTarball({
      'manifest.json': JSON.stringify({
        ...baseManifest,
        application: { ...baseManifest.application, billing },
      }),
      'package.json': JSON.stringify({
        name: `test-bills-credits-${universalIdentifier}`,
        version: '1.0.0',
      }),
    });

    await uploadAppTarball({ tarballBuffer: tarball, universalIdentifier });

    uploadedUniversalIdentifiers.push(universalIdentifier);

    return universalIdentifier;
  };

  const findBillsCredits = async (universalIdentifier: string) => {
    const response = await makeMetadataApiRequest({
      query: FIND_MARKETPLACE_APP_DETAIL,
      variables: { universalIdentifier },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.findMarketplaceAppDetail.billsCredits;
  };

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    for (const universalIdentifier of uploadedUniversalIdentifiers) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: universalIdentifier,
      });
    }

    jest.useFakeTimers();
  });

  it('asks consent to bill credits for an app declaring billable operations', async () => {
    const universalIdentifier = await uploadApp({
      description: '$0.02 per minute recorded',
      operations: {
        recordMeeting: {
          operationType: 'CALL_RECORDING',
          label: 'Meeting recording',
        },
      },
    });

    expect(await findBillsCredits(universalIdentifier)).toBe(true);
  });

  it('does not ask consent to bill credits for an app declaring no billing', async () => {
    const universalIdentifier = await uploadApp();

    expect(await findBillsCredits(universalIdentifier)).toBe(false);
  });
});
