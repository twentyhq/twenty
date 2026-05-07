import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  cleanupTestField,
  cleanupTestObject,
  createTestFieldViaGraphql,
  createTestObjectViaGraphql,
  NON_EXISTENT_UUID,
  uniqueSuffix,
} from 'test/integration/rest/utils/metadata-rest-api.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Field Metadata REST API', () => {
  let parentObjectId: string;

  beforeAll(async () => {
    const { id } = await createTestObjectViaGraphql();

    parentObjectId = id;
  });

  afterAll(async () => {
    await cleanupTestObject(parentObjectId);
  });

  describe('GET /metadata/fields', () => {
    const seededIds: string[] = [];

    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        const { id } = await createTestFieldViaGraphql(parentObjectId);

        seededIds.push(id);
      }
    });

    afterAll(async () => {
      await Promise.all(seededIds.map(cleanupTestField));
      seededIds.length = 0;
    });

    it('returns the clean REST shape: { data, pageInfo, totalCount }', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).not.toHaveProperty('data.fields');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pageInfo.hasNextPage');
      expect(response.body).toHaveProperty('pageInfo.startCursor');
      expect(response.body).toHaveProperty('pageInfo.endCursor');
      expect(typeof response.body.totalCount).toBe('number');
      expect(response.body.totalCount).toBeGreaterThanOrEqual(seededIds.length);
    });

    it('respects limit and surfaces hasNextPage', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=1',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pageInfo.hasNextPage).toBe(true);
    });

    it('paginates forward with starting_after without overlap', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(secondPage);
      const firstIds = firstPage.body.data.map((f: { id: string }) => f.id);
      const secondIds = secondPage.body.data.map((f: { id: string }) => f.id);

      expect(firstIds.some((id: string) => secondIds.includes(id))).toBe(false);
    });

    it('paginates backward with ending_before', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const backPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&ending_before=${secondPage.body.pageInfo.startCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(backPage);
      const firstIds = firstPage.body.data.map((f: { id: string }) => f.id);
      const backIds = backPage.body.data.map((f: { id: string }) => f.id);

      expect(backIds.every((id: string) => firstIds.includes(id))).toBe(true);
    });

    it('rejects combining starting_after and ending_before with 400', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?starting_after=${NON_EXISTENT_UUID}&ending_before=${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });

    it('keeps totalCount stable across pages', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPage.body.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(firstPage.body.totalCount).toBe(secondPage.body.totalCount);
    });
  });

  describe('GET /metadata/fields/:id', () => {
    let testFieldId: string;

    beforeAll(async () => {
      const { id } = await createTestFieldViaGraphql(parentObjectId);

      testFieldId = id;
    });

    afterAll(async () => {
      await cleanupTestField(testFieldId);
    });

    it('returns the field directly without an envelope', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/${testFieldId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.id).toBe(testFieldId);
      expect(response.body).not.toHaveProperty('field');
      expect(response.body.objectMetadataId).toBe(parentObjectId);
    });

    it('returns 400 on a malformed UUID', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/not-a-uuid`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('POST /metadata/fields', () => {
    it('creates a field and returns 201', async () => {
      const suffix = uniqueSuffix();
      const input = {
        objectMetadataId: parentObjectId,
        type: FieldMetadataType.TEXT,
        name: `postField${suffix}`,
        label: `Post Field ${suffix}`,
        isLabelSyncedWithName: false,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/fields',
        body: input,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      try {
        assertRestApiSuccessfulResponse(response, 201);
        expect(response.body.id).toBeDefined();
        expect(response.body).not.toHaveProperty('createOneField');
        expect(response.body.name).toBe(input.name);
        expect(response.body.objectMetadataId).toBe(parentObjectId);
      } finally {
        if (response.body.id) {
          await cleanupTestField(response.body.id);
        }
      }
    });

    it('returns 400 on duplicate name within an object', async () => {
      const { id, input } = await createTestFieldViaGraphql(parentObjectId);

      try {
        const response = await makeRestAPIRequest({
          method: 'post',
          path: '/metadata/fields',
          body: input,
          bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(response, 400);
      } finally {
        await cleanupTestField(id);
      }
    });

    it('returns 400 on invalid input', async () => {
      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/fields',
        body: { name: '' },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('PATCH /metadata/fields/:id', () => {
    let testFieldId: string;

    beforeEach(async () => {
      const { id } = await createTestFieldViaGraphql(parentObjectId);

      testFieldId = id;
    });

    afterEach(async () => {
      await cleanupTestField(testFieldId);
    });

    it('updates and returns the field directly', async () => {
      const newLabel = `Updated Field ${uniqueSuffix()}`;

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/fields/${testFieldId}`,
        body: { label: newLabel },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.id).toBe(testFieldId);
      expect(response.body).not.toHaveProperty('updateOneField');
      expect(response.body.label).toBe(newLabel);
    });

    it('returns 400 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/fields/${NON_EXISTENT_UUID}`,
        body: { label: 'Whatever' },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('PUT /metadata/fields/:id', () => {
    it('behaves equivalently to PATCH', async () => {
      const { id } = await createTestFieldViaGraphql(parentObjectId);

      try {
        const newLabel = `PutField ${uniqueSuffix()}`;

        const response = await makeRestAPIRequest({
          method: 'put',
          path: `/metadata/fields/${id}`,
          body: { label: newLabel },
          bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        expect(response.body.id).toBe(id);
        expect(response.body.label).toBe(newLabel);
      } finally {
        await cleanupTestField(id);
      }
    });
  });

  describe('DELETE /metadata/fields/:id', () => {
    it('deletes the field and returns the deleted resource', async () => {
      const { id } = await createTestFieldViaGraphql(parentObjectId);

      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/fields/${id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body.id).toBe(id);
      expect(response.body).not.toHaveProperty('deleteOneField');

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/${id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/fields/${NON_EXISTENT_UUID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
