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
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { assertViewSortStructure } from 'test/integration/utils/view-test.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import {
  generateViewSortExceptionMessage,
  ViewSortExceptionMessageKey,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';

const TEST_NOT_EXISTING_VIEW_SORT_ID = '20202020-0000-4000-8000-000000000004';

describe('View Sort Resolver', () => {
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
        nameSingular: 'mySortTestObject',
        namePlural: 'mySortTestObjects',
        labelSingular: 'My Sort Test Object',
        labelPlural: 'My Sort Test Objects',
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
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Test View for Sorts',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    await destroyOneCoreView({
      viewId: testViewId,
      expectToFail: false,
    });
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewSort', () => {
    it('should create a new view sort with ASC direction', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
      });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
        viewId: testViewId,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.DESC,
        fieldMetadataId: testFieldMetadataId,
      });

      const operation = createViewSortOperationFactory({ data: sortData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewSortStructure(response.body.data.createCoreViewSort, {
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.DESC,
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewSort', () => {
    it('should update an existing view sort', async () => {
      const sortData = createViewSortData(testViewId, {
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
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
      const sortData = createViewSortData(testViewId, {
        fieldMetadataId: testFieldMetadataId,
      });
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
      const sortData = createViewSortData(testViewId, {
        fieldMetadataId: testFieldMetadataId,
      });
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
