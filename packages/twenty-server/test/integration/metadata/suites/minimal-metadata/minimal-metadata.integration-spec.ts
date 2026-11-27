import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { isDefined } from 'twenty-shared/utils';

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
        isActive
        isSystem
        isRemote
      }
      views {
        id
        universalIdentifier
        name
        icon
        type
        key
        objectMetadataId
        position
        isPrivate
        isActive
      }
      objectViewsHashes {
        objectMetadataId
        hash
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;

type MinimalMetadataResponse = {
  objectMetadataItems: { id: string; namePlural: string }[];
  views: { id: string; objectMetadataId: string }[];
  objectViewsHashes: { objectMetadataId: string; hash: string }[];
};

const fetchMinimalMetadata = async (): Promise<MinimalMetadataResponse> => {
  const response = await makeMetadataApiRequest({
    query: FIND_MINIMAL_METADATA_QUERY,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.minimalMetadata;
};

const getObjectViewsHashByObjectMetadataId = (
  minimalMetadata: MinimalMetadataResponse,
) =>
  Object.fromEntries(
    minimalMetadata.objectViewsHashes.map(({ objectMetadataId, hash }) => [
      objectMetadataId,
      hash,
    ]),
  );

describe('minimalMetadata', () => {
  it('should return objectMetadataItems, views, and collectionHashes', async () => {
    const response = await makeMetadataApiRequest({
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
    const response = await makeMetadataApiRequest({
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
        isActive: true,
        isSystem: expect.any(Boolean),
        isRemote: expect.any(Boolean),
      });
    }
  });

  it('should return properly shaped views', async () => {
    const response = await makeMetadataApiRequest({
      query: FIND_MINIMAL_METADATA_QUERY,
    });

    const { views } = response.body.data.minimalMetadata;

    expect(views.length).toBeGreaterThan(0);

    for (const view of views) {
      expect(view).toMatchObject({
        id: expect.any(String),
        universalIdentifier: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        objectMetadataId: expect.any(String),
        position: expect.any(Number),
        isPrivate: expect.any(Boolean),
        isActive: expect.any(Boolean),
      });
    }
  });

  it('should return one views hash per object that has views', async () => {
    const { views, objectViewsHashes } = await fetchMinimalMetadata();

    const objectMetadataIdsWithViews = new Set(
      views.map((view) => view.objectMetadataId),
    );

    expect(
      objectViewsHashes.map(({ objectMetadataId }) => objectMetadataId).sort(),
    ).toEqual([...objectMetadataIdsWithViews].sort());
  });

  it('should only change the views hash of the object whose views changed', async () => {
    const before = await fetchMinimalMetadata();
    const companyObjectMetadata = before.objectMetadataItems.find(
      (item) => item.namePlural === 'companies',
    );

    if (!isDefined(companyObjectMetadata)) {
      throw new Error('Company object metadata not found');
    }

    const companyObjectMetadataId = companyObjectMetadata.id;

    const {
      data: { createView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Views hash test',
        icon: 'IconTable',
        objectMetadataId: companyObjectMetadataId,
      },
    });

    try {
      const afterCreate = await fetchMinimalMetadata();
      const hashesBefore = getObjectViewsHashByObjectMetadataId(before);
      const hashesAfterCreate =
        getObjectViewsHashByObjectMetadataId(afterCreate);

      expect(hashesAfterCreate[companyObjectMetadataId]).not.toBe(
        hashesBefore[companyObjectMetadataId],
      );

      for (const [objectMetadataId, hash] of Object.entries(hashesBefore)) {
        if (objectMetadataId !== companyObjectMetadataId) {
          expect(hashesAfterCreate[objectMetadataId]).toBe(hash);
        }
      }

      await updateOneView({
        expectToFail: false,
        viewId: createView.id,
        input: { id: createView.id, name: 'Views hash test renamed' },
      });

      const hashesAfterUpdate = getObjectViewsHashByObjectMetadataId(
        await fetchMinimalMetadata(),
      );

      expect(hashesAfterUpdate[companyObjectMetadataId]).not.toBe(
        hashesAfterCreate[companyObjectMetadataId],
      );
    } finally {
      await destroyOneView({ expectToFail: false, viewId: createView.id });
    }
  });

  it('should return properly shaped collectionHashes', async () => {
    const response = await makeMetadataApiRequest({
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
    const response = await makeMetadataApiRequest({
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
    const response = await makeMetadataApiRequest(
      { query: FIND_MINIMAL_METADATA_QUERY },
      INVALID_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
