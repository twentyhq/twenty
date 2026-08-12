import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

// A composite UNIQUE index can't be created through the public index API
// (createOneIndex forces isUnique: false). Application manifest sync is the only
// API-driven path that yields one: it runs the same validate/build/run migration
// internally, provisioning a real composite unique index we can upsert against.
const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FIRST_FIELD_ID = uuidv4();
const SECOND_FIELD_ID = uuidv4();
const PAYLOAD_FIELD_ID = uuidv4();
const INDEX_ID = uuidv4();

const DUAL_A_FIRST_FIELD_ID = uuidv4();
const DUAL_A_SECOND_FIELD_ID = uuidv4();
const DUAL_B_FIRST_FIELD_ID = uuidv4();
const DUAL_B_SECOND_FIELD_ID = uuidv4();
const DUAL_PAYLOAD_FIELD_ID = uuidv4();
const DUAL_INDEX_A_ID = uuidv4();
const DUAL_INDEX_B_ID = uuidv4();

const OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'compositeUpsertRecord',
  namePlural: 'compositeUpsertRecords',
  labelSingular: 'Composite Upsert Record',
  labelPlural: 'Composite Upsert Records',
  description: 'Object to test composite unique index upsert',
  icon: 'IconTestRecord',
  additionalFields: [
    {
      universalIdentifier: FIRST_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'firstKey',
      label: 'First Key',
      isNullable: true,
    },
    {
      universalIdentifier: SECOND_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'secondKey',
      label: 'Second Key',
      isNullable: true,
    },
    {
      universalIdentifier: PAYLOAD_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'payload',
      label: 'Payload',
      isNullable: true,
    },
  ],
});

// Second object with TWO independent composite unique indexes
// (indexA on aFirst+aSecond, indexB on bFirst+bSecond). This lets us exercise
// upsert conflict resolution when a payload can match different rows through
// different unique indexes.
const DUAL_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'dualCompositeUpsertRecord',
  namePlural: 'dualCompositeUpsertRecords',
  labelSingular: 'Dual Composite Upsert Record',
  labelPlural: 'Dual Composite Upsert Records',
  description: 'Object to test upsert with two composite unique indexes',
  icon: 'IconTestRecord',
  additionalFields: [
    {
      universalIdentifier: DUAL_A_FIRST_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'aFirstKey',
      label: 'A First Key',
      isNullable: true,
    },
    {
      universalIdentifier: DUAL_A_SECOND_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'aSecondKey',
      label: 'A Second Key',
      isNullable: true,
    },
    {
      universalIdentifier: DUAL_B_FIRST_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'bFirstKey',
      label: 'B First Key',
      isNullable: true,
    },
    {
      universalIdentifier: DUAL_B_SECOND_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'bSecondKey',
      label: 'B Second Key',
      isNullable: true,
    },
    {
      universalIdentifier: DUAL_PAYLOAD_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'payload',
      label: 'Payload',
      isNullable: true,
    },
  ],
});

const manifest: Manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: {
    objects: [OBJECT, DUAL_OBJECT],
    fields: [],
    indexes: [
      {
        universalIdentifier: INDEX_ID,
        objectUniversalIdentifier: OBJECT.universalIdentifier,
        isUnique: true,
        fields: [
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: FIRST_FIELD_ID,
          },
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: SECOND_FIELD_ID,
          },
        ],
      },
      {
        universalIdentifier: DUAL_INDEX_A_ID,
        objectUniversalIdentifier: DUAL_OBJECT.universalIdentifier,
        isUnique: true,
        fields: [
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: DUAL_A_FIRST_FIELD_ID,
          },
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: DUAL_A_SECOND_FIELD_ID,
          },
        ],
      },
      {
        universalIdentifier: DUAL_INDEX_B_ID,
        objectUniversalIdentifier: DUAL_OBJECT.universalIdentifier,
        isUnique: true,
        fields: [
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: DUAL_B_FIRST_FIELD_ID,
          },
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: DUAL_B_SECOND_FIELD_ID,
          },
        ],
      },
    ],
  },
});

const GQL_FIELDS = `
  id
  firstKey
  secondKey
  payload
`;

const upsertRecords = (data: object[], upsert: boolean) =>
  makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: OBJECT.nameSingular,
      objectMetadataPluralName: OBJECT.namePlural,
      gqlFields: GQL_FIELDS,
      data,
      upsert,
    }),
  );

const getRecords = (response: { body: { data: Record<string, unknown> } }) =>
  response.body.data.createCompositeUpsertRecords as {
    id: string;
    firstKey: string;
    secondKey: string;
    payload: string;
  }[];

const DUAL_GQL_FIELDS = `
  id
  aFirstKey
  aSecondKey
  bFirstKey
  bSecondKey
  payload
`;

const upsertDualRecords = (data: object[], upsert: boolean) =>
  makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: DUAL_OBJECT.nameSingular,
      objectMetadataPluralName: DUAL_OBJECT.namePlural,
      gqlFields: DUAL_GQL_FIELDS,
      data,
      upsert,
    }),
  );

const getDualRecords = (response: { body: { data: Record<string, unknown> } }) =>
  response.body.data.createDualCompositeUpsertRecords as {
    id: string;
    aFirstKey: string;
    aSecondKey: string;
    bFirstKey: string;
    bSecondKey: string;
    payload: string;
  }[];

describe('upsert with composite unique index', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Composite Upsert App',
      description: 'App for composite unique index upsert test',
      sourcePath: 'test-composite-unique-upsert',
    });

    await syncApplication({ manifest, expectToFail: false });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  }, 60000);

  it('updates the existing record when the full composite key matches', async () => {
    const recordId = uuidv4();

    const created = getRecords(
      await upsertRecords(
        [{ id: recordId, firstKey: 'A', secondKey: 'B', payload: 'original' }],
        false,
      ),
    )[0];

    expect(created.id).toBe(recordId);
    expect(created.payload).toBe('original');


    const upserted = getRecords(
      await upsertRecords(
        [{ firstKey: 'A', secondKey: 'B', payload: 'updated' }],
        true,
      ),
    );

    expect(upserted).toHaveLength(1);
    expect(upserted[0].id).toBe(recordId);
    expect(upserted[0].payload).toBe('updated');
  }, 60000);

  it('inserts a new record when only part of the composite key matches', async () => {
    const existingId = uuidv4();
    const newId = uuidv4();

    const created = getRecords(
      await upsertRecords(
        [{ id: existingId, firstKey: 'C', secondKey: 'D', payload: 'first' }],
        false,
      ),
    )[0];

    const upserted = getRecords(
      await upsertRecords(
        [{ id: newId, firstKey: 'C', secondKey: 'X', payload: 'second' }],
        true,
      ),
    );

    expect(upserted).toHaveLength(1);
    expect(upserted[0].id).toBe(newId);
    expect(upserted[0].id).not.toBe(created.id);
    expect(upserted[0].payload).toBe('second');
  }, 60000);

  describe('with two composite unique indexes', () => {
    it('updates the record when a single row matches on both composite indexes', async () => {
      const recordId = uuidv4();

      const created = getDualRecords(
        await upsertDualRecords(
          [
            {
              id: recordId,
              aFirstKey: 'a1',
              aSecondKey: 'a2',
              bFirstKey: 'b1',
              bSecondKey: 'b2',
              payload: 'original',
            },
          ],
          false,
        ),
      )[0];

      expect(created.id).toBe(recordId);
      expect(created.payload).toBe('original');

      // The payload matches this single row through both composite indexes,
      // so there is no ambiguity and the existing record is updated in place.
      const upserted = getDualRecords(
        await upsertDualRecords(
          [
            {
              aFirstKey: 'a1',
              aSecondKey: 'a2',
              bFirstKey: 'b1',
              bSecondKey: 'b2',
              payload: 'updated',
            },
          ],
          true,
        ),
      );

      expect(upserted).toHaveLength(1);
      expect(upserted[0].id).toBe(recordId);
      expect(upserted[0].payload).toBe('updated');
    }, 60000);

    it('fails when the payload matches different rows across the two composite indexes', async () => {
      const firstRecordId = uuidv4();
      const secondRecordId = uuidv4();

      getDualRecords(
        await upsertDualRecords(
          [
            {
              id: firstRecordId,
              aFirstKey: 'c1',
              aSecondKey: 'c2',
              bFirstKey: 'd1',
              bSecondKey: 'd2',
              payload: 'first',
            },
            {
              id: secondRecordId,
              aFirstKey: 'e1',
              aSecondKey: 'e2',
              bFirstKey: 'f1',
              bSecondKey: 'f2',
              payload: 'second',
            },
          ],
          false,
        ),
      );

      // aFirst/aSecond match the first record via indexA while bFirst/bSecond
      // match the second record via indexB. Two distinct rows match, so upsert
      // cannot decide which one to update and must reject the operation.
      const conflictingResponse = await upsertDualRecords(
        [
          {
            aFirstKey: 'c1',
            aSecondKey: 'c2',
            bFirstKey: 'f1',
            bSecondKey: 'f2',
            payload: 'conflicting',
          },
        ],
        true,
      );

      expect(conflictingResponse.body.errors).toBeDefined();
      expect(conflictingResponse.body.errors[0].message).toContain(
        'Multiple records found with the same unique field values',
      );
      expect(conflictingResponse.body.errors[0].extensions.code).toBe(
        'BAD_USER_INPUT',
      );
    }, 60000);
  });
});
