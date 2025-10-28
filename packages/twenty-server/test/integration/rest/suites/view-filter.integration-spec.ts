import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { destroyOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-core-view-filter.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewFilterWithRestApi,
  createTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { assertViewFilterStructure } from 'test/integration/utils/view-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';

describe('View Filter REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let testViewId: string;
  let testViewFilterId: string | undefined;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewFilterObject',
        namePlural: 'testViewFilterObjects',
        labelSingular: 'Test View Filter Object',
        labelPlural: 'Test View Filter Objects',
        icon: 'IconFilter',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const createFieldInput = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: testObjectMetadataId,
      isLabelSyncedWithName: true,
    };

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    testFieldMetadataId = fieldMetadataId;

    const testView = await createTestViewWithRestApi({
      name: 'Test View for Filter Integration',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = testView.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    if (!testViewFilterId) return;

    await destroyOneCoreViewFilter({
      input: {
        id: testViewFilterId,
      },
      expectToFail: false,
    });
    testViewFilterId = undefined;
  });

  describe('GET /metadata/viewFilters', () => {
    it('should return empty array when no view filters exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view filters for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFilters',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view filters for a specific view after creating one', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = viewFilter.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      const returnedViewFilter = response.body.find(
        (el: ViewFilterDTO) => el.id === viewFilter.id,
      );

      jestExpectToBeDefined(returnedViewFilter);

      assertViewFilterStructure(returnedViewFilter, {
        id: viewFilter.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
      });
    });
  });

  describe('POST /metadata/viewFilters', () => {
    it('should create a new view filter with string value', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'test value',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = viewFilter.id;

      assertViewFilterStructure(viewFilter, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'test value',
      });

      testViewFilterId = viewFilter.id;
    });

    it('should create a view filter with numeric value', async () => {
      const numericFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '100',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = numericFilter.id;

      assertViewFilterStructure(numericFilter, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '100',
      });
    });

    it('should create a view filter with boolean value', async () => {
      const booleanFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'true',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = booleanFilter.id;

      assertViewFilterStructure(booleanFilter, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'true',
      });
    });
  });

  describe('GET /metadata/viewFilters/:id', () => {
    it('should return a view filter by id', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'test',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = viewFilter.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'test',
      });

      testViewFilterId = viewFilter.id;
    });

    it('should return empty object for non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/20202020-5262-419d-ab77-575bfaf3db28`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/viewFilters/:id', () => {
    it('should update an existing view filter', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'original',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = viewFilter.id;

      const updateData = {
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      });

      testViewFilterId = viewFilter.id;
    });

    it('should return 404 error when updating non-existent view filter', async () => {
      const updateData = {
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/20202020-d8db-4dfb-b654-01b872851b37`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/viewFilters/:id', () => {
    it('should delete an existing view filter', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        viewId: testViewId,
        operand: ViewFilterOperand.IS,
        value: 'to delete',
        fieldMetadataId: testFieldMetadataId,
      });

      testViewFilterId = viewFilter.id;

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('should return 404 error when deleting non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/20202020-b8a3-4885-ae28-b89c2a4942d8`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
