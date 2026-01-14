import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { deleteViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/delete-view-filter-group-operation-factory.util';
import { destroyViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/destroy-view-filter-group-operation-factory.util';
import { findViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/find-view-filter-group-operation-factory.util';
import { findViewFilterGroupsOperationFactory } from 'test/integration/graphql/utils/find-view-filter-groups-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/update-view-filter-group-operation-factory.util';
import {
  createViewFilterGroupData,
  updateViewFilterGroupData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { assertViewFilterGroupStructure } from 'test/integration/utils/view-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import {
  generateViewFilterGroupExceptionMessage,
  ViewFilterGroupExceptionMessageKey,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';

const TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID =
  '20202020-0000-4000-8000-000000000002';

describe('View Filter Group Resolver', () => {
  let testViewId: string;

  let testObjectMetadataId: string;

  let createdViewFilterGroup: string[] = [];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFilterGroupTestObject',
        namePlural: 'myFilterGroupTestObjects',
        labelSingular: 'My Filter Group Test Object',
        labelPlural: 'My Filter Group Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;
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
      name: 'Test View for Filter Groups',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    // Clean up all created view filter groups
    for (const filterGroupId of createdViewFilterGroup) {
      const destroyOperation = destroyViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });

      await makeGraphqlAPIRequest(destroyOperation);
    }
    createdViewFilterGroup = [];

    await destroyOneCoreView({
      viewId: testViewId,
      expectToFail: false,
    });
  });

  describe('getCoreViewFilterGroups', () => {
    it('should return empty array when no view filter groups exist', async () => {
      const operation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroups).toEqual([]);
    });

    it('should return all filter groups for workspace when no viewId provided', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const createdFilterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(createdFilterGroupId);

      const getOperation = findViewFilterGroupsOperationFactory();
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);

      const foundFilterGroup = response.body.data.getCoreViewFilterGroups.find(
        (el: ViewFilterGroupDTO) => el.id === createdFilterGroupId,
      );

      jestExpectToBeDefined(foundFilterGroup);
      expect(foundFilterGroup).toMatchObject({
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        viewId: testViewId,
      });
    });

    it('should return view filter groups for a specific view', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const createdFilterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(createdFilterGroupId);

      const getOperation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);

      const foundFilterGroup = response.body.data.getCoreViewFilterGroups.find(
        (group: ViewFilterGroupDTO) => group.id === createdFilterGroupId,
      );

      jestExpectToBeDefined(foundFilterGroup);
      assertViewFilterGroupStructure(foundFilterGroup, {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        viewId: testViewId,
      });
    });

    it('should return nested filter groups with parent relationships', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(parentId);

      const childData = createViewFilterGroupData(testViewId, {
        parentViewFilterGroupId: parentId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });

      const childResponse = await makeGraphqlAPIRequest(childOperation);
      const childId = childResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(childId);

      const getOperation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);

      const parentGroup = response.body.data.getCoreViewFilterGroups.find(
        (group: ViewFilterGroupDTO) => group.id === parentId,
      );
      const childGroup = response.body.data.getCoreViewFilterGroups.find(
        (group: ViewFilterGroupDTO) => group.id === childId,
      );

      jestExpectToBeDefined(parentGroup);
      jestExpectToBeDefined(childGroup);

      assertViewFilterGroupStructure(parentGroup, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: null,
      });

      assertViewFilterGroupStructure(childGroup, {
        parentViewFilterGroupId: parentId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
    });
  });

  describe('getCoreViewFilterGroup', () => {
    it('should return null when filter group does not exist', async () => {
      const operation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroup).toBeNull();
    });

    it('should return filter group when it exists', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.NOT,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(filterGroupId);

      const getOperation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);
      assertViewFilterGroupStructure(
        response.body.data.getCoreViewFilterGroup,
        {
          id: filterGroupId,
          logicalOperator: ViewFilterGroupLogicalOperator.NOT,
          viewId: testViewId,
        },
      );
    });
  });

  describe('createCoreViewFilterGroup', () => {
    it('should create a new filter group with AND operator', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      createdViewFilterGroup.push(
        response.body.data.createCoreViewFilterGroup.id,
      );
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
          viewId: testViewId,
        },
      );
    });

    it('should create a filter group with OR operator', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      createdViewFilterGroup.push(
        response.body.data.createCoreViewFilterGroup.id,
      );
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
        },
      );
    });

    it('should create a filter group with NOT operator', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.NOT,
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      createdViewFilterGroup.push(
        response.body.data.createCoreViewFilterGroup.id,
      );
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: ViewFilterGroupLogicalOperator.NOT,
        },
      );
    });

    it('should create a nested filter group with parent relationship', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(parentId);

      const childData = createViewFilterGroupData(testViewId, {
        parentViewFilterGroupId: parentId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });
      const childResponse = await makeGraphqlAPIRequest(childOperation);

      assertGraphQLSuccessfulResponse(childResponse);

      createdViewFilterGroup.push(
        childResponse.body.data.createCoreViewFilterGroup.id,
      );
      assertViewFilterGroupStructure(
        childResponse.body.data.createCoreViewFilterGroup,
        {
          parentViewFilterGroupId: parentId,
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
        },
      );
    });
  });

  describe('updateCoreViewFilterGroup', () => {
    it('should update an existing filter group', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(filterGroupId);

      const updateInput = updateViewFilterGroupData({
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const updateOperation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewFilterGroup).toMatchObject({
        id: filterGroupId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
    });

    it('should update parent relationship of filter group', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(parentId);

      const childData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });
      const childResponse = await makeGraphqlAPIRequest(childOperation);
      const childId = childResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(childId);

      const updateInput = updateViewFilterGroupData({
        parentViewFilterGroupId: parentId,
      });
      const updateOperation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: childId,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewFilterGroup).toMatchObject({
        id: childId,
        parentViewFilterGroupId: parentId,
      });
    });

    it('should throw error when updating non-existent filter group', async () => {
      const updateInput = updateViewFilterGroupData({
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const operation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('deleteCoreViewFilterGroup', () => {
    it('should delete an existing filter group', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(filterGroupId);

      const deleteOperation = deleteViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewFilterGroup).toBe(true);

      const getOperation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      expect(getResponse.body.data.getCoreViewFilterGroup).toBeNull();
    });

    it('should throw an error when deleting non-existent filter group', async () => {
      const operation = deleteViewFilterGroupOperationFactory({
        viewFilterGroupId: TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroyCoreViewFilterGroup', () => {
    it('should destroy an existing filter group', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      createdViewFilterGroup.push(filterGroupId);

      const destroyOperation = destroyViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const response = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.destroyCoreViewFilterGroup).toBe(true);
    });

    it('should throw an error when destroying non-existent filter group', async () => {
      const operation = destroyViewFilterGroupOperationFactory({
        viewFilterGroupId: TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
        ),
      );
    });
  });
});
