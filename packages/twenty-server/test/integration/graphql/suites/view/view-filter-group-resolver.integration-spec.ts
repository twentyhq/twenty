import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { deleteViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/delete-view-filter-group-operation-factory.util';
import { findViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/find-view-filter-group-operation-factory.util';
import { findViewFilterGroupsOperationFactory } from 'test/integration/graphql/utils/find-view-filter-groups-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/update-view-filter-group-operation-factory.util';
import {
  createViewFilterGroupData,
  updateViewFilterGroupData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertSuccessfulResponse,
  assertViewFilterGroupStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test-utils';

describe('View Filter Group Resolver', () => {
  let testViewId: string;

  beforeAll(async () => {
    await cleanupViewRecords();

    const view = await createTestView({
      name: 'Test View for Filter Groups',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  afterEach(async () => {
    const operation = findViewFilterGroupsOperationFactory({
      viewId: testViewId,
    });
    const viewFilterGroups = await makeGraphqlAPIRequest(operation);

    if (viewFilterGroups.body.data.getCoreViewFilterGroups.length > 0) {
      await Promise.all(
        viewFilterGroups.body.data.getCoreViewFilterGroups.map((group: any) => {
          const deleteOperation = deleteViewFilterGroupOperationFactory({
            viewFilterGroupId: group.id,
          });

          return makeGraphqlAPIRequest(deleteOperation);
        }),
      );
    }
  });

  describe('getCoreViewFilterGroups', () => {
    it('should return empty array when no view filter groups exist', async () => {
      const operation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroups).toEqual([]);
    });

    it('should return all filter groups for workspace when no viewId provided', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewFilterGroupsOperationFactory();
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroups).toHaveLength(1);
      expect(response.body.data.getCoreViewFilterGroups[0]).toMatchObject({
        logicalOperator: 'AND',
        viewId: testViewId,
      });
    });

    it('should return view filter groups for a specific view', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'OR',
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroups).toHaveLength(1);
      assertViewFilterGroupStructure(
        response.body.data.getCoreViewFilterGroups[0],
        {
          logicalOperator: 'OR',
          viewId: testViewId,
        },
      );
    });

    it('should return nested filter groups with parent relationships', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      const childData = createViewFilterGroupData(testViewId, {
        parentViewFilterGroupId: parentId,
        logicalOperator: 'OR',
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });

      await makeGraphqlAPIRequest(childOperation);

      const getOperation = findViewFilterGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroups).toHaveLength(2);

      const parentGroup = response.body.data.getCoreViewFilterGroups.find(
        (group: any) => group.parentViewFilterGroupId === null,
      );
      const childGroup = response.body.data.getCoreViewFilterGroups.find(
        (group: any) => group.parentViewFilterGroupId !== null,
      );

      assertViewFilterGroupStructure(parentGroup, {
        logicalOperator: 'AND',
        parentViewFilterGroupId: null,
      });

      assertViewFilterGroupStructure(childGroup, {
        parentViewFilterGroupId: parentId,
        logicalOperator: 'OR',
      });
    });
  });

  describe('getCoreViewFilterGroup', () => {
    it('should return null when filter group does not exist', async () => {
      const operation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: '99999999-1c25-4d02-bf25-6aeccf7ea419',
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilterGroup).toBeNull();
    });

    it('should return filter group when it exists', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'NOT',
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      const getOperation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      assertViewFilterGroupStructure(
        response.body.data.getCoreViewFilterGroup,
        {
          id: filterGroupId,
          logicalOperator: 'NOT',
          viewId: testViewId,
        },
      );
    });
  });

  describe('createCoreViewFilterGroup', () => {
    it('should create a new filter group with AND operator', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: 'AND',
          viewId: testViewId,
        },
      );
    });

    it('should create a filter group with OR operator', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'OR',
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: 'OR',
        },
      );
    });

    it('should create a filter group with NOT operator (default)', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'NOT',
      });
      const operation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterGroupStructure(
        response.body.data.createCoreViewFilterGroup,
        {
          logicalOperator: 'NOT',
        },
      );
    });

    it('should create a nested filter group with parent relationship', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      const childData = createViewFilterGroupData(testViewId, {
        parentViewFilterGroupId: parentId,
        logicalOperator: 'OR',
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });
      const childResponse = await makeGraphqlAPIRequest(childOperation);

      assertSuccessfulResponse(childResponse);
      assertViewFilterGroupStructure(
        childResponse.body.data.createCoreViewFilterGroup,
        {
          parentViewFilterGroupId: parentId,
          logicalOperator: 'OR',
        },
      );
    });
  });

  describe('updateCoreViewFilterGroup', () => {
    it('should update an existing filter group', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      const updateInput = updateViewFilterGroupData({
        logicalOperator: 'OR',
      });
      const updateOperation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewFilterGroup).toMatchObject({
        id: filterGroupId,
        logicalOperator: 'OR',
      });
    });

    it('should update parent relationship of filter group', async () => {
      const parentData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const parentOperation = createViewFilterGroupOperationFactory({
        data: parentData,
      });
      const parentResponse = await makeGraphqlAPIRequest(parentOperation);
      const parentId = parentResponse.body.data.createCoreViewFilterGroup.id;

      const childData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'OR',
      });
      const childOperation = createViewFilterGroupOperationFactory({
        data: childData,
      });
      const childResponse = await makeGraphqlAPIRequest(childOperation);
      const childId = childResponse.body.data.createCoreViewFilterGroup.id;

      const updateInput = updateViewFilterGroupData({
        parentViewFilterGroupId: parentId,
      });
      const updateOperation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: childId,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewFilterGroup).toMatchObject({
        id: childId,
        parentViewFilterGroupId: parentId,
      });
    });

    it('should throw error when updating non-existent filter group', async () => {
      const updateInput = updateViewFilterGroupData({
        logicalOperator: 'AND',
      });
      const operation = updateViewFilterGroupOperationFactory({
        viewFilterGroupId: '99999999-1c25-4d02-bf25-6aeccf7ea419',
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('deleteCoreViewFilterGroup', () => {
    it('should delete an existing filter group', async () => {
      const filterGroupData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'AND',
      });
      const createOperation = createViewFilterGroupOperationFactory({
        data: filterGroupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const filterGroupId =
        createResponse.body.data.createCoreViewFilterGroup.id;

      const deleteOperation = deleteViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewFilterGroup).toBe(true);

      const getOperation = findViewFilterGroupOperationFactory({
        viewFilterGroupId: filterGroupId,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      expect(getResponse.body.data.getCoreViewFilterGroup).toBeNull();
    });

    it('should return false when deleting non-existent filter group', async () => {
      const operation = deleteViewFilterGroupOperationFactory({
        viewFilterGroupId: '99999999-1c25-4d02-bf25-6aeccf7ea419',
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('validation', () => {
    it('should require viewId for creation', async () => {
      const invalidData = {
        logicalOperator: 'AND',
      } as any;
      const operation = createViewFilterGroupOperationFactory({
        data: invalidData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('viewId');
    });

    it('should validate logical operator enum values', async () => {
      const invalidData = createViewFilterGroupData(testViewId, {
        logicalOperator: 'INVALID_OPERATOR' as any,
      });
      const operation = createViewFilterGroupOperationFactory({
        data: invalidData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('logicalOperator');
    });

    it('should allow valid logical operator values', async () => {
      const operators = ['AND', 'OR', 'NOT'];

      for (const operator of operators) {
        const filterGroupData = createViewFilterGroupData(testViewId, {
          logicalOperator: operator,
        });
        const operation = createViewFilterGroupOperationFactory({
          data: filterGroupData,
        });
        const response = await makeGraphqlAPIRequest(operation);

        assertSuccessfulResponse(response);
        expect(
          response.body.data.createCoreViewFilterGroup.logicalOperator,
        ).toBe(operator);
      }
    });
  });
});
