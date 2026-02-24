import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_SECOND_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'ticket',
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  description: 'A support ticket',
  icon: 'IconTicket',
});

const FIELD_GQL_FIELDS = 'id name label type description icon isCustom';

const buildManifest = (overrides?: Partial<Pick<Manifest, 'fields'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [TEST_OBJECT], ...overrides },
  });

const findCustomFields = async () => {
  const { fields } = await findManyFieldsMetadata({
    input: {
      filter: { isCustom: { is: true } },
      paging: { first: 100 },
    },
    gqlFields: FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return (fields ?? []).map(({ node }: { node: unknown }) => node);
};

describe('Manifest update - fields', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing field manifest updates',
      sourcePath: 'test-manifest-update-field',
    });
  }, 60000);

  afterEach(async () => {
    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should create a new field when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ fields: [] }),
      expectToFail: false,
    });

    const fieldsAfterFirstSync = await findCustomFields();
    const descriptionBefore = fieldsAfterFirstSync.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(descriptionBefore).toBeUndefined();

    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'description',
            label: 'Description',
            description: 'Ticket description',
            icon: 'IconFileDescription',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const fieldsAfterSecondSync = await findCustomFields();
    const descriptionAfter = fieldsAfterSecondSync.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(descriptionAfter).toBeDefined();
    expect(descriptionAfter).toMatchObject({
      name: 'description',
      label: 'Description',
      type: FieldMetadataType.TEXT,
      description: 'Ticket description',
      icon: 'IconFileDescription',
    });
  }, 60000);

  it('should update a field when properties change in manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'description',
            label: 'Description',
            description: 'Ticket description',
            icon: 'IconFileDescription',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const fieldsAfterFirstSync = await findCustomFields();
    const fieldBefore = fieldsAfterFirstSync.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(fieldBefore).toBeDefined();
    expect(fieldBefore).toMatchObject({
      name: 'description',
      label: 'Description',
    });

    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'body',
            label: 'Body',
            description: 'Ticket body content',
            icon: 'IconFileDescription',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const fieldsAfterSecondSync = await findCustomFields();
    const renamedField = fieldsAfterSecondSync.find(
      (field: { name: string }) => field.name === 'body',
    );

    expect(renamedField).toBeDefined();
    expect(renamedField).toMatchObject({
      name: 'body',
      label: 'Body',
      type: FieldMetadataType.TEXT,
      description: 'Ticket body content',
    });

    const oldField = fieldsAfterSecondSync.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(oldField).toBeUndefined();
  }, 60000);

  it('should delete a field when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'description',
            label: 'Description',
            description: 'Ticket description',
            icon: 'IconFileDescription',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
          {
            universalIdentifier: TEST_SECOND_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'priority',
            label: 'Priority',
            description: 'Ticket priority',
            icon: 'IconFlag',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const fieldsAfterFirstSync = await findCustomFields();

    expect(
      fieldsAfterFirstSync.find(
        (field: { name: string }) => field.name === 'description',
      ),
    ).toBeDefined();
    expect(
      fieldsAfterFirstSync.find(
        (field: { name: string }) => field.name === 'priority',
      ),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'description',
            label: 'Description',
            description: 'Ticket description',
            icon: 'IconFileDescription',
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const fieldsAfterSecondSync = await findCustomFields();

    expect(
      fieldsAfterSecondSync.find(
        (field: { name: string }) => field.name === 'description',
      ),
    ).toBeDefined();
    expect(
      fieldsAfterSecondSync.find(
        (field: { name: string }) => field.name === 'priority',
      ),
    ).toBeUndefined();
  }, 60000);
});
