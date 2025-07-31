import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

import { createViewOperationFactory } from './create-view-operation-factory.util';
import { createViewData } from './view-data-factory.util';

// GraphQL Response Types
interface GraphQLResponse<T extends Record<string, unknown>> {
  status: number;
  body: {
    data?: T;
    errors?: BaseGraphQLError[];
  };
}

interface CreateViewResponse extends Record<string, unknown> {
  createCoreView: View;
}

export const cleanupViewRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."view"`);
};

export const createTestView = async (
  overrides: Partial<View> = {},
): Promise<View> => {
  const input = createViewData(overrides);

  const operation = createViewOperationFactory({ data: input });
  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreateViewResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test view: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createTestView');
  }

  return response.body.data.createCoreView;
};

export const assertSuccessfulResponse = <T extends Record<string, unknown>>(
  response: GraphQLResponse<T>,
  expectedData?: Partial<T>,
) => {
  expect(response.status).toBe(200);
  expect(response.body.data).toBeDefined();
  expect(response.body.errors).toBeUndefined();

  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

export const assertErrorResponse = <T extends Record<string, unknown>>(
  response: GraphQLResponse<T>,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(400);
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors).toHaveLength(1);

  if (expectedErrorMessage && response.body.errors) {
    expect(response.body.errors[0].message).toContain(expectedErrorMessage);
  }
};

export const assertViewStructure = (
  view: View,
  expectedFields?: Partial<View>,
) => {
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
  viewField: ViewField,
  expectedFields?: Partial<ViewField>,
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
  viewSort: ViewSort,
  expectedFields?: Partial<ViewSort>,
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
  viewFilter: ViewFilter,
  expectedFields?: Partial<ViewFilter>,
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
  viewGroup: ViewGroup,
  expectedFields?: Partial<ViewGroup>,
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
  viewFilterGroup: ViewFilterGroup,
  expectedFields?: Partial<ViewFilterGroup>,
) => {
  expect(viewFilterGroup).toBeDefined();
  expect(viewFilterGroup.id).toBeDefined();
  expect(viewFilterGroup.viewId).toBeDefined();
  expect(viewFilterGroup.logicalOperator).toBeDefined();
  expect([
    ViewFilterGroupLogicalOperator.AND,
    ViewFilterGroupLogicalOperator.OR,
    ViewFilterGroupLogicalOperator.NOT,
  ]).toContain(viewFilterGroup.logicalOperator);

  if (expectedFields) {
    expect(viewFilterGroup).toMatchObject(expectedFields);
  }
};
