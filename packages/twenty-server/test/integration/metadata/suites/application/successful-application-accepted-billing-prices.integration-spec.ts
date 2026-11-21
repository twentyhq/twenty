import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { type ApplicationBillingPrice } from 'twenty-shared/application';

const APP_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000003041';
const ROLE_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000003042';

const TEN_DOLLARS_PRICE: ApplicationBillingPrice = {
  universalIdentifier: '20202020-6b0e-4b1e-9d3a-000000003043',
  label: 'Platform fee',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
};

const TWENTY_DOLLARS_PER_MEMBER_PRICE: ApplicationBillingPrice = {
  ...TEN_DOLLARS_PRICE,
  amountCents: 2000,
  per: 'WORKSPACE_MEMBER',
};

jest.setTimeout(120000);

const uploadVersion = async ({
  version,
  prices,
}: {
  version: string;
  prices: ApplicationBillingPrice[];
}): Promise<void> => {
  const baseManifest = buildBaseManifest({
    appId: APP_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
  });

  const tarballBuffer = await createAppTarball({
    'manifest.json': JSON.stringify({
      ...baseManifest,
      application: { ...baseManifest.application, billing: { prices } },
    }),
    'package.json': JSON.stringify({
      name: 'test-accepted-billing-prices',
      version,
    }),
  });

  await uploadAppTarball({
    tarballBuffer,
    universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
  });
};

const findInstalledApplication = async (): Promise<{
  version: string;
  declaredPrices: ApplicationBillingPrice[];
  acceptedBillingPrices: ApplicationBillingPrice[] | null;
}> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT version, billing->'prices' AS "declaredPrices", "acceptedBillingPrices"
     FROM core."application"
     WHERE "universalIdentifier" = $1 AND "deletedAt" IS NULL`,
    [APP_UNIVERSAL_IDENTIFIER],
  );

  return application;
};

describe('Application accepted billing prices', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('accepts the declared prices on the first install', async () => {
    await uploadVersion({ version: '1.0.0', prices: [TEN_DOLLARS_PRICE] });
    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    expect(await findInstalledApplication()).toEqual({
      version: '1.0.0',
      declaredPrices: [TEN_DOLLARS_PRICE],
      acceptedBillingPrices: [TEN_DOLLARS_PRICE],
    });
  });

  it('keeps the accepted prices when an upgrade changes the amount and the unit', async () => {
    await uploadVersion({
      version: '2.0.0',
      prices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
    });
    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    expect(await findInstalledApplication()).toEqual({
      version: '2.0.0',
      declaredPrices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
      acceptedBillingPrices: [TEN_DOLLARS_PRICE],
    });
  });

  it('rejects an upgrade declaring an invalid price and keeps the accepted prices', async () => {
    await uploadVersion({
      version: '3.0.0',
      prices: [{ ...TEN_DOLLARS_PRICE, amountCents: -1 }],
    });
    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
      expectToFail: true,
    });

    expect(await findInstalledApplication()).toEqual({
      version: '2.0.0',
      declaredPrices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
      acceptedBillingPrices: [TEN_DOLLARS_PRICE],
    });

    await uploadVersion({
      version: '3.0.1',
      prices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
    });
  });

  it('accepts the current prices on a new installation', async () => {
    await uninstallApplication({
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    expect(await findInstalledApplication()).toEqual({
      version: '3.0.1',
      declaredPrices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
      acceptedBillingPrices: [TWENTY_DOLLARS_PER_MEMBER_PRICE],
    });
  });
});
