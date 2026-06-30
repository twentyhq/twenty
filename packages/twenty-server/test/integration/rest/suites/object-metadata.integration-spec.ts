import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  cleanupTestObject,
  createTestObjectViaGraphql,
  extractMetadataItemPayload,
  extractMetadataListPayload,
  NON_EXISTENT_UUID,
  uniqueSuffix,
} from 'test/integration/rest/utils/metadata-rest-api.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import { FeatureFlagKey } from 'twenty-shared/types';

type ObjectShape = { id: string; fields: unknown[]; labelSingular?: string };

describe.each([
  ['new format', true],
  ['legacy format', false],
] as const)('Object Metadata REST API (%s)', (_shapeLabel, isNewFormat) => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      value: isNewFormat,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      value: false,
      expectToFail: false,
    });
  });

  describe('GET /metadata/objects', () => {
    const seededIds: string[] = [];

    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        const { id } = await createTestObjectViaGraphql();

        seededIds.push(id);
      }
    });

    afterAll(async () => {
      await Promise.all(seededIds.map(cleanupTestObject));
      seededIds.length = 0;
    });

    it('returns the expected envelope shape', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.objects');
        expect(Array.isArray(response.body.data)).toBe(true);
      } else {
        expect(Array.isArray(response.body.data?.objects)).toBe(true);
      }
      expect(response.body).toHaveProperty('pageInfo.hasNextPage');
      expect(response.body).toHaveProperty('pageInfo.startCursor');
      expect(response.body).toHaveProperty('pageInfo.endCursor');
      expect(typeof response.body.totalCount).toBe('number');
      expect(response.body.totalCount).toBeGreaterThanOrEqual(seededIds.length);
    });

    it('inlines fields[] on each object', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=5',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const { items } = extractMetadataListPayload<ObjectShape>(
        response.body,
        'objects',
      );

      for (const object of items) {
        expect(Array.isArray(object.fields)).toBe(true);
      }
    });

    it('respects limit and surfaces hasNextPage', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=1',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const { items, pageInfo } = extractMetadataListPayload<ObjectShape>(
        response.body,
        'objects',
      );

      expect(items.length).toBe(1);
      expect(pageInfo.hasNextPage).toBe(true);
      expect(pageInfo.startCursor).toBe(items[0].id);
      expect(pageInfo.endCursor).toBe(items[0].id);
    });

    it('paginates forward with starting_after without overlap', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(firstPage);
      const firstPayload = extractMetadataListPayload<ObjectShape>(
        firstPage.body,
        'objects',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(secondPage);
      const secondPayload = extractMetadataListPayload<ObjectShape>(
        secondPage.body,
        'objects',
      );

      const firstIds = firstPayload.items.map((o) => o.id);
      const secondIds = secondPayload.items.map((o) => o.id);

      expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
    });

    it('paginates backward with ending_before', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const firstPayload = extractMetadataListPayload<ObjectShape>(
        firstPage.body,
        'objects',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPayload = extractMetadataListPayload<ObjectShape>(
        secondPage.body,
        'objects',
      );

      const backPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&ending_before=${secondPayload.pageInfo.startCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(backPage);
      const backPayload = extractMetadataListPayload<ObjectShape>(
        backPage.body,
        'objects',
      );

      const firstIds = firstPayload.items.map((o) => o.id);
      const backIds = backPayload.items.map((o) => o.id);

      expect(backIds.every((id) => firstIds.includes(id))).toBe(true);
    });

    it('rejects combining starting_after and ending_before with 400', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?starting_after=${NON_EXISTENT_UUID}&ending_before=${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });

    it('keeps totalCount stable across pages', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const firstPayload = extractMetadataListPayload<ObjectShape>(
        firstPage.body,
        'objects',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(firstPage);
      assertRestApiSuccessfulResponse(secondPage);
      expect(firstPage.body.totalCount).toBe(secondPage.body.totalCount);
    });

    it('reports hasNextPage=false when the page covers all results', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=200',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const { items, pageInfo } = extractMetadataListPayload<ObjectShape>(
        response.body,
        'objects',
      );

      expect(items.length).toBe(response.body.totalCount);
      expect(pageInfo.hasNextPage).toBe(false);
    });
  });

  describe('GET /metadata/objects/:id', () => {
    let testObjectId: string;

    beforeAll(async () => {
      const { id } = await createTestObjectViaGraphql();

      testObjectId = id;
    });

    afterAll(async () => {
      await cleanupTestObject(testObjectId);
    });

    it('returns the object with fields[] populated', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects/${testObjectId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const object = extractMetadataItemPayload<ObjectShape>(
        response.body,
        'object',
      );

      expect(object.id).toBe(testObjectId);
      expect(Array.isArray(object.fields)).toBe(true);
      expect(object.fields.length).toBeGreaterThan(0);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.object');
      } else {
        expect(response.body).toHaveProperty('data.object');
      }
    });

    it('returns 400 on a malformed UUID', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects/not-a-uuid`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects/${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('POST /metadata/objects', () => {
    it('creates an object and returns 201 with default fields[]', async () => {
      const suffix = uniqueSuffix();
      const input = {
        nameSingular: `postObj${suffix}`,
        namePlural: `postObj${suffix}s`,
        labelSingular: `Post Obj ${suffix}`,
        labelPlural: `Post Objs ${suffix}`,
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/objects',
        body: input,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const object = extractMetadataItemPayload<ObjectShape>(
        response.body,
        'createOneObject',
      );

      try {
        assertRestApiSuccessfulResponse(response, 201);
        expect(object.id).toBeDefined();
        expect(
          (object as ObjectShape & { nameSingular: string }).nameSingular,
        ).toBe(input.nameSingular);
        expect(Array.isArray(object.fields)).toBe(true);
        expect(object.fields.length).toBeGreaterThan(0);
        if (isNewFormat) {
          expect(response.body).not.toHaveProperty('data.createOneObject');
        } else {
          expect(response.body).toHaveProperty('data.createOneObject');
        }
      } finally {
        if (object.id) {
          await cleanupTestObject(object.id);
        }
      }
    });

    it('returns 400 on duplicate nameSingular', async () => {
      const { id, input } = await createTestObjectViaGraphql();

      try {
        const response = await makeRestAPIRequest({
          method: 'post',
          path: '/metadata/objects',
          body: input,
          bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(response, 400);
      } finally {
        await cleanupTestObject(id);
      }
    });

    it('returns 400 on invalid input', async () => {
      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/objects',
        body: { nameSingular: '' },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('PATCH /metadata/objects/:id', () => {
    let testObjectId: string;

    beforeEach(async () => {
      const { id } = await createTestObjectViaGraphql();

      testObjectId = id;
    });

    afterEach(async () => {
      await cleanupTestObject(testObjectId);
    });

    it('updates and returns the object with fields[]', async () => {
      const newLabel = `Updated ${uniqueSuffix()}`;

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/objects/${testObjectId}`,
        body: { labelSingular: newLabel },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const object = extractMetadataItemPayload<ObjectShape>(
        response.body,
        'updateOneObject',
      );

      expect(object.id).toBe(testObjectId);
      expect(object.labelSingular).toBe(newLabel);
      expect(Array.isArray(object.fields)).toBe(true);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.updateOneObject');
      } else {
        expect(response.body).toHaveProperty('data.updateOneObject');
      }
    });

    it('returns 404 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/objects/${NON_EXISTENT_UUID}`,
        body: { labelSingular: 'Whatever' },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PUT /metadata/objects/:id', () => {
    it('behaves equivalently to PATCH', async () => {
      const { id } = await createTestObjectViaGraphql();

      try {
        const newLabel = `PutUpdate ${uniqueSuffix()}`;

        const response = await makeRestAPIRequest({
          method: 'put',
          path: `/metadata/objects/${id}`,
          body: { labelSingular: newLabel },
          bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        const object = extractMetadataItemPayload<ObjectShape>(
          response.body,
          'updateOneObject',
        );

        expect(object.id).toBe(id);
        expect(object.labelSingular).toBe(newLabel);
        expect(Array.isArray(object.fields)).toBe(true);
      } finally {
        await cleanupTestObject(id);
      }
    });
  });

  describe('DELETE /metadata/objects/:id', () => {
    it('deletes the object and returns the deleted resource', async () => {
      const { id } = await createTestObjectViaGraphql();

      const patchResponse = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/objects/${id}`,
        body: { isActive: false },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(patchResponse);

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/objects/${id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      const deleted = extractMetadataItemPayload<{ id: string }>(
        deleteResponse.body,
        'deleteOneObject',
      );

      expect(deleted.id).toBe(id);
      if (isNewFormat) {
        expect(deleteResponse.body).not.toHaveProperty('data.deleteOneObject');
      } else {
        expect(deleteResponse.body).toHaveProperty('data.deleteOneObject');
      }

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects/${id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/objects/${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
