import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';
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

// The label identifier view field on the INDEX view must be visible and
// strictly lowest, whatever provisioned it (fieldIndexViewFieldOnCreate on
// creation, objectIndexViewLabelIdentifierOnUpdate on relabel).
const expectLabelIdentifierIndexViewFieldVisibleAndLowest = async ({
  objectMetadataId,
  labelFieldMetadataId,
}: {
  objectMetadataId: string;
  labelFieldMetadataId: string;
}) => {
  const { data: viewsData } = await findViews({
    objectMetadataId,
    gqlFields: 'id key',
    expectToFail: false,
  });

  const indexView = viewsData?.getViews.find(
    (view) => view.key === ViewKey.INDEX,
  );

  if (!isDefined(indexView)) {
    throw new Error('expected an INDEX view for the ticket object');
  }

  const { data: viewFieldsData } = await findViewFields({
    viewId: indexView.id,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  const viewFields = viewFieldsData?.getViewFields ?? [];
  const labelViewField = viewFields.find(
    (viewField) => viewField.fieldMetadataId === labelFieldMetadataId,
  );

  if (!isDefined(labelViewField)) {
    throw new Error('expected an INDEX view field for the label identifier');
  }

  expect(labelViewField.isVisible).toBe(true);

  for (const viewField of viewFields) {
    if (viewField.id !== labelViewField.id) {
      expect(labelViewField.position).toBeLessThan(viewField.position);
    }
  }
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

    // Object created with a custom label identifier backed by a field created
    // in the same sync: its INDEX view field is visible and strictly lowest.
    if (!isDefined(ticketAfterFirstSync) || !isDefined(nameField)) {
      throw new Error('expected the ticket object and its name field');
    }

    await expectLabelIdentifierIndexViewFieldVisibleAndLowest({
      objectMetadataId: ticketAfterFirstSync.id,
      labelFieldMetadataId: nameField.id,
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

    const ticketAfterSecondSync = await findTicketObject();
    const codeField = ticketAfterSecondSync?.fieldsList?.find(
      (field) => field.name === 'code',
    );

    expect(codeField).toBeDefined();
    expect(ticketAfterSecondSync?.labelIdentifierFieldMetadataId).toBe(
      codeField?.id,
    );

    if (!isDefined(ticketAfterSecondSync) || !isDefined(codeField)) {
      throw new Error('expected the ticket object and its code field');
    }

    await expectLabelIdentifierIndexViewFieldVisibleAndLowest({
      objectMetadataId: ticketAfterSecondSync.id,
      labelFieldMetadataId: codeField.id,
    });
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
