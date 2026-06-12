import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  cleanupTestField,
  cleanupTestObject,
  createTestFieldViaGraphql,
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
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

type FieldShape = {
  id: string;
  name?: string;
  label?: string;
  objectMetadataId?: string;
};

describe.each([
  ['new format', true],
  ['legacy format', false],
] as const)('Field Metadata REST API (%s)', (_shapeLabel, isNewFormat) => {
  let parentObjectId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      value: isNewFormat,
      expectToFail: false,
    });

    const { id } = await createTestObjectViaGraphql();

    parentObjectId = id;
  });

  afterAll(async () => {
    await cleanupTestObject(parentObjectId);
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      value: false,
      expectToFail: false,
    });
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

    it('returns the expected envelope shape', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.fields');
        expect(Array.isArray(response.body.data)).toBe(true);
      } else {
        expect(Array.isArray(response.body.data?.fields)).toBe(true);
      }
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
      const { items, pageInfo } = extractMetadataListPayload<FieldShape>(
        response.body,
        'fields',
      );

      expect(items.length).toBe(1);
      expect(pageInfo.hasNextPage).toBe(true);
    });

    it('paginates forward with starting_after without overlap', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const firstPayload = extractMetadataListPayload<FieldShape>(
        firstPage.body,
        'fields',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(secondPage);
      const secondPayload = extractMetadataListPayload<FieldShape>(
        secondPage.body,
        'fields',
      );

      const firstIds = firstPayload.items.map((f) => f.id);
      const secondIds = secondPayload.items.map((f) => f.id);

      expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
    });

    it('paginates backward with ending_before', async () => {
      const firstPage = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/fields?limit=2',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const firstPayload = extractMetadataListPayload<FieldShape>(
        firstPage.body,
        'fields',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const secondPayload = extractMetadataListPayload<FieldShape>(
        secondPage.body,
        'fields',
      );

      const backPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&ending_before=${secondPayload.pageInfo.startCursor}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(backPage);
      const backPayload = extractMetadataListPayload<FieldShape>(
        backPage.body,
        'fields',
      );

      const firstIds = firstPayload.items.map((f) => f.id);
      const backIds = backPayload.items.map((f) => f.id);

      expect(backIds.every((id) => firstIds.includes(id))).toBe(true);
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

      const firstPayload = extractMetadataListPayload<FieldShape>(
        firstPage.body,
        'fields',
      );

      const secondPage = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields?limit=2&starting_after=${firstPayload.pageInfo.endCursor}`,
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

    it('returns the field with expected envelope', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/${testFieldId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const field = extractMetadataItemPayload<FieldShape>(
        response.body,
        'field',
      );

      expect(field.id).toBe(testFieldId);
      expect(field.objectMetadataId).toBe(parentObjectId);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.field');
      } else {
        expect(response.body).toHaveProperty('data.field');
      }
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

      const field = extractMetadataItemPayload<FieldShape>(
        response.body,
        'createOneField',
      );

      try {
        assertRestApiSuccessfulResponse(response, 201);
        expect(field.id).toBeDefined();
        expect(field.name).toBe(input.name);
        expect(field.objectMetadataId).toBe(parentObjectId);
        if (isNewFormat) {
          expect(response.body).not.toHaveProperty('data.createOneField');
        } else {
          expect(response.body).toHaveProperty('data.createOneField');
        }
      } finally {
        if (field.id) {
          await cleanupTestField(field.id);
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

    it('updates and returns the field', async () => {
      const newLabel = `Updated Field ${uniqueSuffix()}`;

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/fields/${testFieldId}`,
        body: { label: newLabel },
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      const field = extractMetadataItemPayload<FieldShape>(
        response.body,
        'updateOneField',
      );

      expect(field.id).toBe(testFieldId);
      expect(field.label).toBe(newLabel);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.updateOneField');
      } else {
        expect(response.body).toHaveProperty('data.updateOneField');
      }
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
        const field = extractMetadataItemPayload<FieldShape>(
          response.body,
          'updateOneField',
        );

        expect(field.id).toBe(id);
        expect(field.label).toBe(newLabel);
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
      const deleted = extractMetadataItemPayload<FieldShape>(
        response.body,
        'deleteOneField',
      );

      expect(deleted.id).toBe(id);
      if (isNewFormat) {
        expect(response.body).not.toHaveProperty('data.deleteOneField');
      } else {
        expect(response.body).toHaveProperty('data.deleteOneField');
      }

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
