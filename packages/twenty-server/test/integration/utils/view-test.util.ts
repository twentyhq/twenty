import { type ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { type ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { type ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { type ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { type View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

export const cleanupViewRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."view"`);
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
  validLogicalOperators: string[] = [
    ViewFilterGroupLogicalOperator.AND,
    ViewFilterGroupLogicalOperator.OR,
    ViewFilterGroupLogicalOperator.NOT,
  ],
) => {
  expect(viewFilterGroup).toBeDefined();
  expect(viewFilterGroup.id).toBeDefined();
  expect(viewFilterGroup.viewId).toBeDefined();
  expect(viewFilterGroup.logicalOperator).toBeDefined();
  expect(validLogicalOperators).toContain(viewFilterGroup.logicalOperator);

  if (expectedFields) {
    expect(viewFilterGroup).toMatchObject(expectedFields);
  }
};
