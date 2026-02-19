import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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
    const response = await makeMetadataAPIRequest({
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
    const response = await makeMetadataAPIRequest({
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
    const response = await makeMetadataAPIRequest({
      query: OBJECT_RECORD_COUNTS_QUERY,
    });

    const counts: { objectNamePlural: string; totalCount: number }[] =
      response.body.data.objectRecordCounts;

    const negativeEntries = counts.filter((entry) => entry.totalCount < 0);

    expect(negativeEntries).toHaveLength(0);
  });

  it('should reject requests with an invalid token', async () => {
    const response = await makeMetadataAPIRequest(
      { query: OBJECT_RECORD_COUNTS_QUERY },
      INVALID_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
