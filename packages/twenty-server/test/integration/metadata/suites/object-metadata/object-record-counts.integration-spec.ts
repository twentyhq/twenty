import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { isDefined } from 'twenty-shared/utils';

const OBJECT_RECORD_COUNTS_QUERY = gql`
  query ObjectRecordCounts {
    objectRecordCounts {
      objectNamePlural
      totalCount
    }
  }
`;

describe('objectRecordCounts', () => {
  it('should return counts for all workspace objects', async () => {
    const response = await makeMetadataApiRequest({
      query: OBJECT_RECORD_COUNTS_QUERY,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.objectRecordCounts).toBeDefined();

    const counts: { objectNamePlural: string; totalCount: number }[] =
      response.body.data.objectRecordCounts;

    expect(Array.isArray(counts)).toBe(true);
    expect(counts.length).toBeGreaterThan(0);

    for (const entry of counts) {
      expect(typeof entry.objectNamePlural).toBe('string');
      expect(entry.objectNamePlural.length).toBeGreaterThan(0);
      expect(typeof entry.totalCount).toBe('number');
      expect(entry.totalCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include well-known standard objects', async () => {
    const response = await makeMetadataApiRequest({
      query: OBJECT_RECORD_COUNTS_QUERY,
    });

    const counts: { objectNamePlural: string; totalCount: number }[] =
      response.body.data.objectRecordCounts;

    const objectNames = counts.map((entry) => entry.objectNamePlural);

    expect(objectNames).toContain('people');
    expect(objectNames).toContain('companies');
    expect(objectNames).toContain('opportunities');
  });

  it('should return non-negative totalCount values', async () => {
    const response = await makeMetadataApiRequest({
      query: OBJECT_RECORD_COUNTS_QUERY,
    });

    const counts: { objectNamePlural: string; totalCount: number }[] =
      response.body.data.objectRecordCounts;

    const negativeEntries = counts.filter((entry) => entry.totalCount < 0);

    expect(negativeEntries).toHaveLength(0);
  });

  it('should reject requests with an invalid token', async () => {
    const response = await makeMetadataApiRequest(
      { query: OBJECT_RECORD_COUNTS_QUERY },
      INVALID_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

// Regression for #29416: a freshly created table is never analyzed, so
// pg_class.reltuples stays -1 and the count read 0 despite records existing.
describe('objectRecordCounts for a newly created object', () => {
  const OBJECT_NAME_SINGULAR = 'recordCountProbe';
  const OBJECT_NAME_PLURAL = 'recordCountProbes';
  const RECORD_COUNT = 3;

  let objectMetadataId: string | undefined;

  beforeAll(async () => {
    const { data, errors } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: OBJECT_NAME_PLURAL,
        labelSingular: 'Record Count Probe',
        labelPlural: 'Record Count Probes',
        isLabelSyncedWithName: false,
      },
    });

    expect(errors).toBeUndefined();
    objectMetadataId = data.createOneObject.id;

    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME_SINGULAR,
        objectMetadataPluralName: OBJECT_NAME_PLURAL,
        gqlFields: 'id',
        data: Array.from({ length: RECORD_COUNT }, (_, index) => ({
          name: `Probe ${index + 1}`,
        })),
      }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    if (!isDefined(objectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('counts records in a never-analyzed table instead of returning 0', async () => {
    // n_live_tup is reported asynchronously after insert, so poll until it settles
    await expectEventually(async () => {
      const response = await makeMetadataApiRequest({
        query: OBJECT_RECORD_COUNTS_QUERY,
      });

      const counts: { objectNamePlural: string; totalCount: number }[] =
        response.body.data.objectRecordCounts;

      const probe = counts.find(
        (entry) => entry.objectNamePlural === OBJECT_NAME_PLURAL,
      );

      expect(probe?.totalCount).toBe(RECORD_COUNT);
    });
  });
});
