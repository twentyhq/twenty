import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createApiKeyWithFieldPermission } from 'test/integration/permissions/utils/create-api-key-with-field-permission.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { FieldMetadataType } from 'twenty-shared/types';

const OBJECT_SINGULAR = 'uniqueDeletedTestObject';
const OBJECT_PLURAL = 'uniqueDeletedTestObjects';
const GQL_FIELDS = `
  id
  reference
  deletedAt
`;

type TestRecord = { id: string; reference: string; deletedAt: string | null };

const createRecord = (reference: string) =>
  makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: OBJECT_SINGULAR,
      objectMetadataPluralName: OBJECT_PLURAL,
      gqlFields: GQL_FIELDS,
      data: [{ reference }],
    }),
  );

const createRecordOrThrow = async (reference: string): Promise<TestRecord> => {
  const response = await createRecord(reference);

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createUniqueDeletedTestObjects[0];
};

const deleteRecord = (id: string) =>
  makeGraphqlApiRequest(
    deleteManyOperationFactory({
      objectMetadataSingularName: OBJECT_SINGULAR,
      objectMetadataPluralName: OBJECT_PLURAL,
      gqlFields: GQL_FIELDS,
      filter: { id: { in: [id] } },
    }),
  );

const restoreRecords = ({
  ids,
  gqlFields = GQL_FIELDS,
  token,
}: {
  ids: string[];
  gqlFields?: string;
  token?: string;
}) =>
  makeGraphqlApiRequest(
    restoreManyOperationFactory({
      objectMetadataSingularName: OBJECT_SINGULAR,
      objectMetadataPluralName: OBJECT_PLURAL,
      gqlFields,
      filter: { id: { in: ids } },
    }),
    token,
  );

describe('unique field with deleted records', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Invoice',
        labelPlural: 'Invoices',
        icon: 'IconFileInvoice',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;

    await createOneFieldMetadata({
      input: {
        name: 'reference',
        label: 'Reference',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
        name
        isUnique
      `,
    });
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('lets a new record reuse the value of a deleted record', async () => {
    const deletedRecord = await createRecordOrThrow('reused');

    await deleteRecord(deletedRecord.id);

    const newRecord = await createRecordOrThrow('reused');

    expect(newRecord.id).not.toBe(deletedRecord.id);
    expect(newRecord.deletedAt).toBeNull();
  });

  it('rejects a value held by a live record, naming the field and that record', async () => {
    const liveRecord = await createRecordOrThrow('taken');

    const response = await createRecord('taken');

    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      userFriendlyMessage:
        'Another Invoice already has the same Reference (taken).',
      conflictingRecordId: liveRecord.id,
      conflictingObjectNameSingular: OBJECT_SINGULAR,
    });
  });

  it('refuses to restore a record whose value a live record now holds', async () => {
    const deletedRecord = await createRecordOrThrow('restored');

    await deleteRecord(deletedRecord.id);

    const liveRecord = await createRecordOrThrow('restored');

    const refusedRestoreResponse = await restoreRecords({
      ids: [deletedRecord.id],
    });

    expect(refusedRestoreResponse.body.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      userFriendlyMessage:
        'Cannot restore: another Invoice already has the same Reference (restored).',
      conflictingRecordId: liveRecord.id,
      conflictingObjectNameSingular: OBJECT_SINGULAR,
    });

    await deleteRecord(liveRecord.id);

    const restoreResponse = await restoreRecords({ ids: [deletedRecord.id] });

    expect(restoreResponse.body.errors).toBeUndefined();
    expect(restoreResponse.body.data.restoreUniqueDeletedTestObjects).toEqual([
      { id: deletedRecord.id, reference: 'restored', deletedAt: null },
    ]);
  });

  it('keeps the value and the live record out of the error for a caller who cannot read the field', async () => {
    const deletedRecord = await createRecordOrThrow('unreadable');

    await deleteRecord(deletedRecord.id);
    await createRecordOrThrow('unreadable');

    const readRestrictedApiKey = await createApiKeyWithFieldPermission({
      objectNameSingular: OBJECT_SINGULAR,
      fieldName: 'reference',
      canReadFieldValue: false,
    });

    const refusedRestoreResponse = await restoreRecords({
      ids: [deletedRecord.id],
      gqlFields: 'id',
      token: readRestrictedApiKey.token,
    });

    await deleteApiKeysWithObjectRecordGrants([readRestrictedApiKey]);

    const { extensions } = refusedRestoreResponse.body.errors[0];

    expect(extensions.userFriendlyMessage).toBe(
      'Cannot restore: another Invoice already has the same Reference.',
    );
    expect(extensions.conflictingRecordId).toBeUndefined();
  });
});
