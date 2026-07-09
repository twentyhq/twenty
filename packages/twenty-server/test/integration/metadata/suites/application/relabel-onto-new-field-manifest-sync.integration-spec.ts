import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();
const CODE_FIELD_ID = uuidv4();

const buildTicketObject = ({
  labelIdentifierFieldMetadataUniversalIdentifier,
  additionalFields,
}: {
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  additionalFields: ObjectManifest['fields'];
}) =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'ticket',
    namePlural: 'tickets',
    labelSingular: 'Ticket',
    labelPlural: 'Tickets',
    description: 'A support ticket',
    icon: 'IconTicket',
    labelIdentifierFieldMetadataUniversalIdentifier,
    additionalFields,
  });

const NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const CODE_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: CODE_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'code',
  label: 'Code',
};

const buildManifest = (object: ObjectManifest) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [object] },
  });

const findTicketObject = async () => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: {},
      paging: { first: 100 },
    },
    gqlFields: `
      id
      universalIdentifier
      labelIdentifierFieldMetadataId
      fieldsList {
        id
        name
        universalIdentifier
      }
    `,
    expectToFail: false,
  });

  return objects.find(
    (object) => object.universalIdentifier === TEST_OBJECT_ID,
  );
};

describe('Manifest sync - relabel label identifier onto a newly introduced field', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing label identifier relabel on manifest sync',
      sourcePath: 'test-relabel-onto-new-field',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should introduce a new field and relabel onto it in a single sync', async () => {
    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          additionalFields: [NAME_FIELD],
        }),
      ),
      expectToFail: false,
    });

    const ticketAfterFirstSync = await findTicketObject();

    expect(ticketAfterFirstSync).toBeDefined();

    const nameField = ticketAfterFirstSync?.fieldsList?.find(
      (field) => field.name === 'name',
    );

    expect(nameField).toBeDefined();
    expect(ticketAfterFirstSync?.labelIdentifierFieldMetadataId).toBe(
      nameField?.id,
    );

    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: CODE_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    const ticketAfterSecondSync = await findTicketObject();
    const codeField = ticketAfterSecondSync?.fieldsList?.find(
      (field) => field.name === 'code',
    );

    expect(codeField).toBeDefined();
    expect(ticketAfterSecondSync?.labelIdentifierFieldMetadataId).toBe(
      codeField?.id,
    );
  }, 60000);

  it('should relabel onto a newly introduced field when introduction and relabel are split across two syncs, exposing the enriched labelIdentifierFieldMetadataId through the metadata API', async () => {
    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          additionalFields: [NAME_FIELD],
        }),
      ),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: CODE_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    const ticket = await findTicketObject();
    const codeField = ticket?.fieldsList?.find(
      (field) => field.name === 'code',
    );

    expect(codeField).toBeDefined();
    expect(isDefined(ticket?.labelIdentifierFieldMetadataId)).toBe(true);
    expect(ticket?.labelIdentifierFieldMetadataId).toBe(codeField?.id);
  }, 60000);
});
