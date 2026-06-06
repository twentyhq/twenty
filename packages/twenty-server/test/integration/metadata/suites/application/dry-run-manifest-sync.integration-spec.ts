import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'objects' | 'fields'>>,
) => buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findCustomObjectNames = async (): Promise<string[]> => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: { isCustom: { is: true } },
      paging: { first: 100 },
    },
    gqlFields: 'id nameSingular',
    expectToFail: false,
  });

  return objects.map((object) => object.nameSingular);
};

describe('Manifest sync - dry run', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Dry Run Test Application',
      description: 'App for testing dry-run manifest sync',
      sourcePath: 'dry-run-manifest-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('returns the planned actions without applying them', async () => {
    const ticketObject = buildDefaultObjectManifest({
      nameSingular: 'dryRunTicket',
      namePlural: 'dryRunTickets',
      labelSingular: 'Dry Run Ticket',
      labelPlural: 'Dry Run Tickets',
      description: 'A support ticket',
    });

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject] }),
      expectToFail: false,
    });

    const invoiceObject = buildDefaultObjectManifest({
      nameSingular: 'dryRunInvoice',
      namePlural: 'dryRunInvoices',
      labelSingular: 'Dry Run Invoice',
      labelPlural: 'Dry Run Invoices',
      description: 'A billing invoice',
    });

    const dryRunResponse = await syncApplication({
      manifest: buildManifest({ objects: [ticketObject, invoiceObject] }),
      dryRun: true,
      expectToFail: false,
    });

    expect(dryRunResponse.errors).toBeUndefined();
    expect(dryRunResponse.data.syncApplication.actions.length).toBeGreaterThan(
      0,
    );

    const customObjectNames = await findCustomObjectNames();

    expect(customObjectNames).toContain('dryRunTicket');
    expect(customObjectNames).not.toContain('dryRunInvoice');
  }, 60000);
});
