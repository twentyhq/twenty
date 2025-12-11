import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const assertViewStructure = (
  view: ViewEntity,
  expectedFields?: Partial<ViewEntity>,
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
  viewField: ViewFieldEntity,
  expectedFields?: Partial<ViewFieldEntity>,
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
  viewSort: ViewSortEntity,
  expectedFields?: Partial<ViewSortEntity>,
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
  viewFilter: ViewFilterEntity,
  expectedFields?: Partial<ViewFilterEntity>,
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
  viewGroup: ViewGroupEntity,
  expectedFields?: Partial<ViewGroupEntity>,
) => {
  expect(viewGroup).toBeDefined();
  expect(viewGroup.id).toBeDefined();
  expect(viewGroup.viewId).toBeDefined();
  expect(viewGroup.fieldValue).toBeDefined();
  expect(typeof viewGroup.isVisible).toBe('boolean');
  expect(typeof viewGroup.position).toBe('number');

  if (expectedFields) {
    expect(viewGroup).toMatchObject(expectedFields);
  }
};

export const assertViewFilterGroupStructure = (
  viewFilterGroup: ViewFilterGroupEntity,
  expectedFields?: Partial<ViewFilterGroupEntity>,
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
