import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_SORT_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createViewSortOperationFactory } from 'test/integration/graphql/utils/create-view-sort-operation-factory.util';
import { deleteViewSortOperationFactory } from 'test/integration/graphql/utils/delete-view-sort-operation-factory.util';
import { destroyViewSortOperationFactory } from 'test/integration/graphql/utils/destroy-view-sort-operation-factory.util';
import { findViewSortsOperationFactory } from 'test/integration/graphql/utils/find-view-sorts-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewSortOperationFactory } from 'test/integration/graphql/utils/update-view-sort-operation-factory.util';
import {
  createViewSortData,
  updateViewSortData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import {
  assertViewSortStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import {
  generateViewSortExceptionMessage,
  ViewSortExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-sort.exception';

describe('View Sort Resolver', () => {
  let testViewId: string;

  beforeEach(async () => {
    await cleanupViewRecords();

    const view = await createTestViewWithGraphQL({
      name: 'Test View for Sorts',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('getCoreViewSorts', () => {
    it('should return empty array when no view sorts exist', async () => {
      const operation = findViewSortsOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewSorts).toEqual([]);
    });

    it('should return view sorts for a specific view', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.ASC,
      });
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewSortsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewSorts).toHaveLength(1);
      assertViewSortStructure(response.body.data.getCoreViewSorts[0], {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: ViewSortDirection.ASC,
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewSort', () => {
    it('should create a new view sort with ASC direction', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.ASC,
      });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: ViewSortDirection.ASC,
        viewId: testViewId,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.DESC,
      });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: ViewSortDirection.DESC,
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewSort', () => {
    it('should update an existing view sort', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.ASC,
      });
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewSort = createResponse.body.data.createCoreViewSort;

      const updateInput = updateViewSortData({
        direction: ViewSortDirection.DESC,
      });
      const updateOperation = updateViewSortOperationFactory({
        viewSortId: viewSort.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewSort).toMatchObject({
        id: viewSort.id,
        direction: 'DESC',
      });
    });

    it('should throw an error when updating non-existent view sort', async () => {
      const operation = updateViewSortOperationFactory({
        viewSortId: TEST_NOT_EXISTING_VIEW_SORT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_SORT_ID,
        ),
      );
    });
  });

  describe('deleteCoreViewSort', () => {
    it('should delete an existing view sort', async () => {
      const sortData = createViewSortData(testViewId);
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewSort = createResponse.body.data.createCoreViewSort;

      const deleteOperation = deleteViewSortOperationFactory({
        viewSortId: viewSort.id,
      });
      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewSort).toBe(true);
    });

    it('should throw an error when deleting non-existent view sort', async () => {
      const operation = deleteViewSortOperationFactory({
        viewSortId: TEST_NOT_EXISTING_VIEW_SORT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_SORT_ID,
        ),
      );
    });
  });

  describe('destroyCoreViewSort', () => {
    it('should destroy an existing view sort', async () => {
      const sortData = createViewSortData(testViewId);
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewSort = createResponse.body.data.createCoreViewSort;

      const destroyOperation = destroyViewSortOperationFactory({
        viewSortId: viewSort.id,
      });
      const response = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.destroyCoreViewSort).toBe(true);
    });

    it('should throw an error when destroying non-existent view sort', async () => {
      const operation = destroyViewSortOperationFactory({
        viewSortId: TEST_NOT_EXISTING_VIEW_SORT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_SORT_ID,
        ),
      );
    });
  });
});
