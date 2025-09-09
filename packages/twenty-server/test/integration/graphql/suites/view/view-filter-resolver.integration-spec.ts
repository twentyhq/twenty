import { TEST_NOT_EXISTING_VIEW_FILTER_ID } from 'test/integration/constants/test-view-ids.constants';
import { createViewFilterOperationFactory } from 'test/integration/graphql/utils/create-view-filter-operation-factory.util';
import { deleteViewFilterOperationFactory } from 'test/integration/graphql/utils/delete-view-filter-operation-factory.util';
import { destroyViewFilterOperationFactory } from 'test/integration/graphql/utils/destroy-view-filter-operation-factory.util';
import { findViewFiltersOperationFactory } from 'test/integration/graphql/utils/find-view-filters-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFilterOperationFactory } from 'test/integration/graphql/utils/update-view-filter-operation-factory.util';
import { createViewFilterData } from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import {
  assertViewFilterStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import {
  ViewFilterExceptionMessageKey,
  generateViewFilterExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-filter.exception';

describe('View Filter Resolver', () => {
  let testViewId: string;
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFilterTestObject',
        namePlural: 'myFilterTestObjects',
        labelSingular: 'My Filter Test Object',
        labelPlural: 'My Filter Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
    });

    testFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
    await cleanupViewRecords();
  });

  beforeEach(async () => {
    await cleanupViewRecords();

    const view = await createTestViewWithGraphQL({
      name: 'Test View for Filters',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  describe('getCoreViewFilters', () => {
    it('should return empty array when no view filters exist', async () => {
      const operation = findViewFiltersOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilters).toEqual([]);
    });

    it('should return view filters for a specific view', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        fieldMetadataId: testFieldMetadataId,
      });
      const createOperation = createViewFilterOperationFactory({
        data: filterData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewFiltersOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilters).toHaveLength(1);
      assertViewFilterStructure(response.body.data.getCoreViewFilters[0], {
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewFilter', () => {
    it('should create a new view filter with string value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: ViewFilterOperand.IS,
        value: 'test value',
        fieldMetadataId: testFieldMetadataId,
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.IS,
        value: 'test value',
        viewId: testViewId,
      });
    });

    it('should create a view filter with numeric value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: 100,
        fieldMetadataId: testFieldMetadataId,
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: 100,
        viewId: testViewId,
      });
    });

    it('should create a view filter with boolean value', async () => {
      const operation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: ViewFilterOperand.IS,
          value: true,
          fieldMetadataId: testFieldMetadataId,
        }),
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: testFieldMetadataId,
        operand: ViewFilterOperand.IS,
        value: true,
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewFilter', () => {
    it('should update an existing view filter', async () => {
      const createOperation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: ViewFilterOperand.CONTAINS,
          value: 'original',
          fieldMetadataId: testFieldMetadataId,
        }),
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const updateOperation = updateViewFilterOperationFactory({
        viewFilterId: viewFilterId,
        data: {
          operand: ViewFilterOperand.DOES_NOT_CONTAIN,
          value: 'updated',
        },
      });

      const response = await makeGraphqlAPIRequest(updateOperation);

      assertGraphQLSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.updateCoreViewFilter, {
        id: viewFilterId,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'updated',
      });
    });

    it('should throw an error when updating non-existent view filter', async () => {
      const operation = updateViewFilterOperationFactory({
        viewFilterId: TEST_NOT_EXISTING_VIEW_FILTER_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_ID,
        ),
      );
    });
  });

  describe('deleteCoreViewFilter', () => {
    it('should delete an existing view filter', async () => {
      const createOperation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: ViewFilterOperand.CONTAINS,
          value: 'to delete',
          fieldMetadataId: testFieldMetadataId,
        }),
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const deleteOperation = deleteViewFilterOperationFactory({
        viewFilterId: viewFilterId,
      });

      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewFilter).toBe(true);
    });

    it('should throw an error when deleting non-existent view filter', async () => {
      const operation = deleteViewFilterOperationFactory({
        viewFilterId: TEST_NOT_EXISTING_VIEW_FILTER_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_ID,
        ),
      );
    });
  });

  describe('destroyCoreViewFilter', () => {
    it('should destroy an existing view filter', async () => {
      const createOperation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: ViewFilterOperand.CONTAINS,
          value: 'to destroy',
          fieldMetadataId: testFieldMetadataId,
        }),
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const destroyOperation = destroyViewFilterOperationFactory({
        viewFilterId: viewFilterId,
      });

      const response = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.destroyCoreViewFilter).toBe(true);
    });

    it('should throw an error when destroying non-existent view filter', async () => {
      const operation = destroyViewFilterOperationFactory({
        viewFilterId: TEST_NOT_EXISTING_VIEW_FILTER_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_ID,
        ),
      );
    });
  });
});
