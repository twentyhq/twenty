import { TEST_FIELD_METADATA_1_ID } from 'test/integration/constants/test-view-ids.constants';
import { createViewSortOperationFactory } from 'test/integration/graphql/utils/create-view-sort-operation-factory.util';
import { deleteViewSortOperationFactory } from 'test/integration/graphql/utils/delete-view-sort-operation-factory.util';
import { findViewSortsOperationFactory } from 'test/integration/graphql/utils/find-view-sorts-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewSortOperationFactory } from 'test/integration/graphql/utils/update-view-sort-operation-factory.util';
import {
  createViewSortData,
  updateViewSortData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertErrorResponse,
  assertSuccessfulResponse,
  assertViewSortStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test-utils';

describe('View Sort Resolver', () => {
  let testViewId: string;

  beforeAll(async () => {
    await cleanupViewRecords();

    const view = await createTestView({
      name: 'Test View for Sorts',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  afterEach(async () => {
    const operation = findViewSortsOperationFactory({ viewId: testViewId });
    const viewSorts = await makeGraphqlAPIRequest(operation);

    if (viewSorts.body.data.getCoreViewSorts.length > 0) {
      await Promise.all(
        viewSorts.body.data.getCoreViewSorts.map((sort: any) => {
          const deleteOperation = deleteViewSortOperationFactory({
            viewSortId: sort.id,
          });

          return makeGraphqlAPIRequest(deleteOperation);
        }),
      );
    }
  });

  describe('getCoreViewSorts', () => {
    it('should return empty array when no view sorts exist', async () => {
      const operation = findViewSortsOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewSorts).toEqual([]);
    });

    it('should return view sorts for a specific view', async () => {
      const sortData = createViewSortData(testViewId, { direction: 'ASC' });
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewSortsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewSorts).toHaveLength(1);
      assertViewSortStructure(response.body.data.getCoreViewSorts[0], {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: 'ASC',
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewSort', () => {
    it('should create a new view sort with ASC direction', async () => {
      const sortData = createViewSortData(testViewId, { direction: 'ASC' });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: 'ASC',
        viewId: testViewId,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const sortData = createViewSortData(testViewId, { direction: 'DESC' });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        direction: 'DESC',
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewSort', () => {
    it('should update an existing view sort', async () => {
      const sortData = createViewSortData(testViewId, { direction: 'ASC' });
      const createOperation = createViewSortOperationFactory({
        data: sortData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewSort = createResponse.body.data.createCoreViewSort;

      const updateInput = updateViewSortData({ direction: 'DESC' });
      const updateOperation = updateViewSortOperationFactory({
        viewSortId: viewSort.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewSort).toMatchObject({
        id: viewSort.id,
        direction: 'DESC',
      });
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

      assertSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewSort).toBe(true);
    });
  });

  describe('validation', () => {
    const requiredFields = ['viewId', 'fieldMetadataId', 'direction'];
    const validInput = {
      viewId: testViewId,
      fieldMetadataId: TEST_FIELD_METADATA_1_ID,
      direction: 'ASC',
    };

    requiredFields.forEach((field) => {
      it(`should require ${field} for creation`, async () => {
        const invalidInput = { ...validInput };

        delete invalidInput[field as keyof typeof invalidInput];

        const operation = createViewSortOperationFactory({
          data: invalidInput,
        });
        const response = await makeGraphqlAPIRequest(operation);

        assertErrorResponse(response, field);
      });
    });
  });
});
