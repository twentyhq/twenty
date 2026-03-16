import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const FIND_MINIMAL_METADATA_QUERY = gql`
  query FindMinimalMetadata {
    minimalMetadata {
      objectMetadataItems {
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        icon
        isCustom
        isActive
        isSystem
        isRemote
      }
      views {
        id
        type
        key
        objectMetadataId
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;

describe('minimalMetadata', () => {
  it('should return objectMetadataItems, views, and collectionHashes', async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    expect(response.body.errors).toBeUndefined();

    const { minimalMetadata } = response.body.data;

    expect(minimalMetadata).toBeDefined();
    expect(Array.isArray(minimalMetadata.objectMetadataItems)).toBe(true);
    expect(Array.isArray(minimalMetadata.views)).toBe(true);
    expect(Array.isArray(minimalMetadata.collectionHashes)).toBe(true);
  });

  it('should return properly shaped objectMetadataItems', async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    const { objectMetadataItems } = response.body.data.minimalMetadata;

    expect(objectMetadataItems.length).toBeGreaterThan(0);

    for (const item of objectMetadataItems) {
      expect(item).toMatchObject({
        id: expect.any(String),
        nameSingular: expect.any(String),
        namePlural: expect.any(String),
        labelSingular: expect.any(String),
        labelPlural: expect.any(String),
        isCustom: expect.any(Boolean),
        isActive: true,
        isSystem: expect.any(Boolean),
        isRemote: expect.any(Boolean),
      });
    }
  });

  it('should return properly shaped views', async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    const { views } = response.body.data.minimalMetadata;

    expect(views.length).toBeGreaterThan(0);

    for (const view of views) {
      expect(view).toMatchObject({
        id: expect.any(String),
        type: expect.any(String),
        objectMetadataId: expect.any(String),
      });
    }
  });

  it('should return properly shaped collectionHashes', async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    const { collectionHashes } = response.body.data.minimalMetadata;

    expect(collectionHashes.length).toBeGreaterThan(0);

    for (const collectionHash of collectionHashes) {
      expect(collectionHash).toMatchObject({
        collectionName: expect.any(String),
        hash: expect.any(String),
      });
    }
  });

  it('should include well-known standard objects', async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    const { objectMetadataItems } = response.body.data.minimalMetadata;

    const objectNames = objectMetadataItems.map(
      (item: { namePlural: string }) => item.namePlural,
    );

    expect(objectNames).toContain('people');
    expect(objectNames).toContain('companies');
    expect(objectNames).toContain('opportunities');
  });

  it('should reject requests with an invalid token', async () => {
    const response = await makeMetadataAPIRequest(
      { query: FIND_MINIMAL_METADATA_QUERY },
      INVALID_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
