import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { createViewOperationFactory } from './create-view-operation-factory.util';
import { createViewData } from './view-data-factory.util';

export const cleanupViewRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."view"`);
};

export const createTestView = async (overrides: Record<string, any> = {}) => {
  const input = createViewData(overrides);

  const operation = createViewOperationFactory({ data: input });
  const response = await makeGraphqlAPIRequest(operation);

  if (response.body.errors) {
    throw new Error(
      `Failed to create test view: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data.createCoreView;
};

export const assertSuccessfulResponse = (response: any, expectedData?: any) => {
  expect(response.status).toBe(200);
  expect(response.body.data).toBeDefined();
  expect(response.body.errors).toBeUndefined();

  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

export const assertErrorResponse = (
  response: any,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(400);
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors).toHaveLength(1);

  if (expectedErrorMessage) {
    expect(response.body.errors[0].message).toContain(expectedErrorMessage);
  }
};

export const assertViewStructure = (view: any, expectedFields?: any) => {
  expect(view).toBeDefined();
  expect(view.id).toBeDefined();
  expect(view.name).toBeDefined();
  expect(view.objectMetadataId).toBeDefined();
  expect(view.workspaceId).toBeDefined();
  expect(view.createdAt).toBeDefined();
  expect(view.updatedAt).toBeDefined();

  if (expectedFields) {
    expect(view).toMatchObject(expectedFields);
  }
};

export const assertViewFieldStructure = (
  viewField: any,
  expectedFields?: any,
) => {
  expect(viewField).toBeDefined();
  expect(viewField.id).toBeDefined();
  expect(viewField.fieldMetadataId).toBeDefined();
  expect(viewField.viewId).toBeDefined();
  expect(typeof viewField.position).toBe('number');
  expect(typeof viewField.isVisible).toBe('boolean');
  expect(typeof viewField.size).toBe('number');

  if (expectedFields) {
    expect(viewField).toMatchObject(expectedFields);
  }
};

export const assertViewSortStructure = (
  viewSort: any,
  expectedFields?: any,
) => {
  expect(viewSort).toBeDefined();
  expect(viewSort.id).toBeDefined();
  expect(viewSort.fieldMetadataId).toBeDefined();
  expect(viewSort.viewId).toBeDefined();
  expect(viewSort.direction).toBeDefined();
  expect(['ASC', 'DESC']).toContain(viewSort.direction);

  if (expectedFields) {
    expect(viewSort).toMatchObject(expectedFields);
  }
};

export const assertViewFilterStructure = (
  viewFilter: any,
  expectedFields?: any,
) => {
  expect(viewFilter).toBeDefined();
  expect(viewFilter.id).toBeDefined();
  expect(viewFilter.fieldMetadataId).toBeDefined();
  expect(viewFilter.viewId).toBeDefined();
  expect(viewFilter.operand).toBeDefined();
  expect(viewFilter.value).toBeDefined();

  if (expectedFields) {
    expect(viewFilter).toMatchObject(expectedFields);
  }
};

export const assertViewGroupStructure = (
  viewGroup: any,
  expectedFields?: any,
) => {
  expect(viewGroup).toBeDefined();
  expect(viewGroup.id).toBeDefined();
  expect(viewGroup.fieldMetadataId).toBeDefined();
  expect(viewGroup.viewId).toBeDefined();
  expect(viewGroup.fieldValue).toBeDefined();
  expect(typeof viewGroup.isVisible).toBe('boolean');
  expect(typeof viewGroup.position).toBe('number');

  if (expectedFields) {
    expect(viewGroup).toMatchObject(expectedFields);
  }
};

export const assertViewFilterGroupStructure = (
  viewFilterGroup: any,
  expectedFields?: any,
) => {
  expect(viewFilterGroup).toBeDefined();
  expect(viewFilterGroup.id).toBeDefined();
  expect(viewFilterGroup.viewId).toBeDefined();
  expect(viewFilterGroup.logicalOperator).toBeDefined();
  expect(['AND', 'OR']).toContain(viewFilterGroup.logicalOperator);

  if (expectedFields) {
    expect(viewFilterGroup).toMatchObject(expectedFields);
  }
};
