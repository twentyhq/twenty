import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  cleanupTestObject,
  createTestObjectViaGraphql,
  NON_EXISTENT_UUID,
  uniqueSuffix,
} from 'test/integration/rest/utils/metadata-rest-api.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';

describe('Object Metadata REST API', () => {
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

    it('returns the clean REST shape: { data, pageInfo, totalCount }', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).not.toHaveProperty('data.objects');
      expect(Array.isArray(response.body.data)).toBe(true);
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
      for (const object of response.body.data) {
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
      expect(response.body.data.length).toBe(1);
      expect(response.body.pageInfo.hasNextPage).toBe(true);
      expect(response.body.pageInfo.startCursor).toBe(response.body.data[0].id);
      expect(response.body.pageInfo.endCursor).toBe(response.body.data[0].id);
    });

    it('paginates forward with starting_after without overlap', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(firstPage);

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(secondPage);
      const firstPageIds = firstPage.body.data.map((o: { id: string }) => o.id);
      const secondPageIds = secondPage.body.data.map(
        (o: { id: string }) => o.id,
      );

      expect(
        firstPageIds.some((id: string) => secondPageIds.includes(id)),
      ).toBe(false);
    });

    it('paginates backward with ending_before', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const backPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&ending_before=${secondPage.body.pageInfo.startCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(backPage);
      const firstPageIds = firstPage.body.data.map((o: { id: string }) => o.id);
      const backPageIds = backPage.body.data.map((o: { id: string }) => o.id);

      expect(backPageIds.every((id: string) => firstPageIds.includes(id))).toBe(
        true,
      );
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

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
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
      expect(response.body.data.length).toBe(response.body.totalCount);
      expect(response.body.pageInfo.hasNextPage).toBe(false);
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

    it('returns the object directly with fields[] populated', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/objects/${testObjectId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.id).toBe(testObjectId);
      expect(response.body).not.toHaveProperty('object');
      expect(Array.isArray(response.body.fields)).toBe(true);
      expect(response.body.fields.length).toBeGreaterThan(0);
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

      try {
        assertRestApiSuccessfulResponse(response, 201);
        expect(response.body.id).toBeDefined();
        expect(response.body.nameSingular).toBe(input.nameSingular);
        expect(response.body).not.toHaveProperty('createOneObject');
        expect(Array.isArray(response.body.fields)).toBe(true);
        expect(response.body.fields.length).toBeGreaterThan(0);
      } finally {
        if (response.body.id) {
          await cleanupTestObject(response.body.id);
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

    it('updates and returns the object directly with fields[]', async () => {
      const newLabel = `Updated ${uniqueSuffix()}`;

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/objects/${testObjectId}`,
        body: { labelSingular: newLabel },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.id).toBe(testObjectId);
      expect(response.body).not.toHaveProperty('updateOneObject');
      expect(response.body.labelSingular).toBe(newLabel);
      expect(Array.isArray(response.body.fields)).toBe(true);
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
        expect(response.body.id).toBe(id);
        expect(response.body.labelSingular).toBe(newLabel);
        expect(Array.isArray(response.body.fields)).toBe(true);
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
      expect(deleteResponse.body.id).toBe(id);
      expect(deleteResponse.body).not.toHaveProperty('deleteOneObject');

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
