import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'objects' | 'fields'>>,
) => buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const OBJECT_GQL_FIELDS =
  'id nameSingular namePlural labelSingular labelPlural description icon isCustom isActive';

const findCustomObjects = async () => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: { isCustom: { is: true } },
      paging: { first: 100 },
    },
    gqlFields: OBJECT_GQL_FIELDS,
    expectToFail: false,
  });

  return objects;
};

describe('Manifest update - objects', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing object manifest updates',
      sourcePath: 'test-manifest-update-object',
    });
  }, 60000);

  afterEach(async () => {
    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should create a new object when added to manifest on second sync', async () => {
    const ticketObject = buildDefaultObjectManifest({
      nameSingular: 'ticket',
      namePlural: 'tickets',
      labelSingular: 'Ticket',
      labelPlural: 'Tickets',
      description: 'A support ticket',
      icon: 'IconTicket',
    });

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject] }),
      expectToFail: false,
    });

    const objectsAfterFirstSync = await findCustomObjects();
    const ticket = objectsAfterFirstSync.find(
      (obj) => obj.nameSingular === 'ticket',
    );

    expect(ticket).toBeDefined();
    expect(ticket).toMatchObject({
      nameSingular: 'ticket',
      labelSingular: 'Ticket',
      description: 'A support ticket',
      icon: 'IconTicket',
    });

    const invoiceObject = buildDefaultObjectManifest({
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      description: 'A billing invoice',
      icon: 'IconFileInvoice',
    });

    await syncApplication({
      manifest: buildManifest({
        objects: [ticketObject, invoiceObject],
      }),
      expectToFail: false,
    });

    const objectsAfterSecondSync = await findCustomObjects();
    const ticketAfter = objectsAfterSecondSync.find(
      (obj) => obj.nameSingular === 'ticket',
    );
    const invoiceAfter = objectsAfterSecondSync.find(
      (obj) => obj.nameSingular === 'invoice',
    );

    expect(ticketAfter).toBeDefined();
    expect(invoiceAfter).toBeDefined();
    expect(invoiceAfter).toMatchObject({
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      description: 'A billing invoice',
      icon: 'IconFileInvoice',
      isCustom: true,
    });
  }, 60000);

  it('should update object properties when changed in manifest on second sync', async () => {
    const ticketObject = buildDefaultObjectManifest({
      nameSingular: 'ticket',
      namePlural: 'tickets',
      labelSingular: 'Ticket',
      labelPlural: 'Tickets',
      description: 'A support ticket',
      icon: 'IconTicket',
    });

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject] }),
      expectToFail: false,
    });

    const objectsAfterFirstSync = await findCustomObjects();
    const ticketBefore = objectsAfterFirstSync.find(
      (obj) => obj.nameSingular === 'ticket',
    );

    expect(ticketBefore).toMatchObject({
      labelSingular: 'Ticket',
      description: 'A support ticket',
      icon: 'IconTicket',
    });

    const updatedTicketObject = {
      ...ticketObject,
      labelSingular: 'Support Ticket',
      labelPlural: 'Support Tickets',
      description: 'A customer support ticket',
      icon: 'IconHeadset',
    };

    await syncApplication({
      manifest: buildManifest({ objects: [updatedTicketObject] }),
      expectToFail: false,
    });

    const objectsAfterSecondSync = await findCustomObjects();
    const ticketAfter = objectsAfterSecondSync.find(
      (obj) => obj.nameSingular === 'ticket',
    );

    expect(ticketAfter).toBeDefined();
    expect(ticketAfter).toMatchObject({
      nameSingular: 'ticket',
      labelSingular: 'Support Ticket',
      labelPlural: 'Support Tickets',
      description: 'A customer support ticket',
      icon: 'IconHeadset',
    });
  }, 60000);

  it('should delete an object when removed from manifest on second sync', async () => {
    const ticketObject = buildDefaultObjectManifest({
      nameSingular: 'ticket',
      namePlural: 'tickets',
      labelSingular: 'Ticket',
      labelPlural: 'Tickets',
      description: 'A support ticket',
      icon: 'IconTicket',
    });

    const invoiceObject = buildDefaultObjectManifest({
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      description: 'A billing invoice',
      icon: 'IconFileInvoice',
    });

    await syncApplication({
      manifest: buildManifest({
        objects: [ticketObject, invoiceObject],
      }),
      expectToFail: false,
    });

    const objectsAfterFirstSync = await findCustomObjects();

    expect(
      objectsAfterFirstSync.find((obj) => obj.nameSingular === 'ticket'),
    ).toBeDefined();
    expect(
      objectsAfterFirstSync.find((obj) => obj.nameSingular === 'invoice'),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject] }),
      expectToFail: false,
    });

    const objectsAfterSecondSync = await findCustomObjects();

    expect(
      objectsAfterSecondSync.find((obj) => obj.nameSingular === 'ticket'),
    ).toBeDefined();
    expect(
      objectsAfterSecondSync.find((obj) => obj.nameSingular === 'invoice'),
    ).toBeUndefined();
  }, 60000);
});
