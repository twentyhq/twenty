import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_SECOND_FIELD_ID = uuidv4();
const TEST_NUMBER_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'ticket',
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  description: 'A support ticket',
  icon: 'IconTicket',
});

const buildManifest = (overrides?: Partial<Pick<Manifest, 'fields'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [TEST_OBJECT], ...overrides },
  });

const findObjectFields = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const object = objects.find(
    (o) => o.universalIdentifier === TEST_OBJECT.universalIdentifier,
  );

  return object?.fieldsList ?? [];
};

const findFieldWithNullable = async (fieldName: string) => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: {
      filter: {},
      paging: { first: 100 },
    },
    gqlFields: `
        id
        universalIdentifier
        fieldsList {
          name
          isNullable
        }
      `,
  });

  const object = objects.find(
    (o) => o.universalIdentifier === TEST_OBJECT.universalIdentifier,
  );

  return object?.fieldsList?.find((field) => field.name === fieldName);
};

const buildReferenceFieldManifest = (isNullable: boolean): FieldManifest => ({
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'reference',
  label: 'Reference',
  description: 'Ticket reference',
  icon: 'IconFileDescription',
  isNullable,
  defaultValue: "'N/A'",
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
});

// NUMBER is used here (rather than a TEXT field) because the data API
// coerces null/omitted TEXT values to '' via the null-equivalent processor,
// so a TEXT column can never actually hold NULL. NUMBER preserves NULL, which
// is what the nullable -> non-nullable backfill needs to act on.
const buildEstimateFieldManifest = (
  params:
    | { isNullable: true; defaultValue?: number }
    | { isNullable: false; defaultValue: number },
): FieldManifest => {
  const commonEstimateFields = {
    universalIdentifier: TEST_NUMBER_FIELD_ID,
    type: FieldMetadataType.NUMBER as const,
    name: 'estimate',
    label: 'Estimate',
    description: 'Ticket estimate',
    icon: 'IconNumber',
    objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
  };

  if (params.isNullable) {
    return {
      ...commonEstimateFields,
      isNullable: true,
      ...(isDefined(params.defaultValue)
        ? { defaultValue: params.defaultValue }
        : {}),
    };
  }

  return {
    ...commonEstimateFields,
    isNullable: false,
    defaultValue: params.defaultValue,
  };
};

const createTicketRecord = async (data: Record<string, unknown>) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: TEST_OBJECT.nameSingular,
      gqlFields: `
        id
        estimate
      `,
      data,
    }),
  );

  return response.body.data?.[`create${capitalize(TEST_OBJECT.nameSingular)}`];
};

const findTicketRecordById = async (recordId: string) => {
  const response = await makeGraphqlAPIRequest(
    findOneOperationFactory({
      objectMetadataSingularName: TEST_OBJECT.nameSingular,
      gqlFields: `
        id
        estimate
      `,
      filter: { id: { eq: recordId } },
    }),
  );

  return response.body.data?.[TEST_OBJECT.nameSingular];
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
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should create a new field when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ fields: [] }),
      expectToFail: false,
    });

    const fieldsAfterFirstSync = await findObjectFields();

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

    const fieldsAfterSecondSync = await findObjectFields();
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

    const fieldsAfterFirstSync = await findObjectFields();
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

    const fieldsAfterSecondSync = await findObjectFields();
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

    const fieldsAfterFirstSync = await findObjectFields();

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

    const fieldsAfterSecondSync = await findObjectFields();

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

  it('should update isNullable when changed in manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ fields: [buildReferenceFieldManifest(true)] }),
      expectToFail: false,
    });

    const fieldAfterFirstSync = await findFieldWithNullable('reference');

    expect(fieldAfterFirstSync).toBeDefined();
    expect(fieldAfterFirstSync?.isNullable).toBe(true);

    await syncApplication({
      manifest: buildManifest({ fields: [buildReferenceFieldManifest(false)] }),
      expectToFail: false,
    });

    const fieldAfterSecondSync = await findFieldWithNullable('reference');

    expect(fieldAfterSecondSync?.isNullable).toBe(false);

    await syncApplication({
      manifest: buildManifest({ fields: [buildReferenceFieldManifest(true)] }),
      expectToFail: false,
    });

    const fieldAfterThirdSync = await findFieldWithNullable('reference');

    expect(fieldAfterThirdSync?.isNullable).toBe(true);
  }, 60000);

  it('should backfill existing null rows when a field becomes non-nullable on second sync', async () => {
    // First sync creates a nullable field with no default.
    await syncApplication({
      manifest: buildManifest({
        fields: [buildEstimateFieldManifest({ isNullable: true })],
      }),
      expectToFail: false,
    });

    // Persist a record whose estimate is NULL on the underlying column.
    const recordId = uuidv4();
    const createdRecord = await createTicketRecord({
      id: recordId,
      estimate: null,
    });

    expect(createdRecord?.id).toBe(recordId);
    expect(createdRecord?.estimate).toBeNull();

    // Second sync makes the field non-nullable with a default value, which
    // must backfill the existing NULL row before SET NOT NULL is enforced.
    await syncApplication({
      manifest: buildManifest({
        fields: [
          buildEstimateFieldManifest({ isNullable: false, defaultValue: 42 }),
        ],
      }),
      expectToFail: false,
    });

    const fieldAfterSecondSync = await findFieldWithNullable('estimate');

    expect(fieldAfterSecondSync?.isNullable).toBe(false);

    const backfilledRecord = await findTicketRecordById(recordId);

    expect(backfilledRecord?.estimate).toBe(42);
  }, 60000);

  it('should create a unique index when field has isUnique set to true', async () => {
    await syncApplication({
      manifest: buildManifest({
        fields: [
          {
            universalIdentifier: TEST_FIELD_ID,
            type: FieldMetadataType.TEXT,
            name: 'externalId',
            label: 'External ID',
            description: 'Unique external identifier',
            icon: 'IconId',
            isUnique: true,
            isNullable: true,
            objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const object = objects.find(
      (objectMetadata) =>
        objectMetadata.universalIdentifier === TEST_OBJECT.universalIdentifier,
    );

    expect(object).toBeDefined();

    const externalIdField = object?.fieldsList.find(
      (field) => field.name === 'externalId',
    );

    expect(externalIdField).toBeDefined();

    const uniqueIndex = object?.indexMetadataList.find(
      (index) =>
        index.isUnique &&
        index.indexFieldMetadataList.some(
          (indexField) => indexField.fieldMetadataId === externalIdField?.id,
        ),
    );

    expect(uniqueIndex).toBeDefined();
    expect(uniqueIndex?.isUnique).toBe(true);
  }, 60000);
});
