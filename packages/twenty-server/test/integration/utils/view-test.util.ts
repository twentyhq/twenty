import { ViewFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const assertViewStructure = (
  view: ViewDTO | ViewEntity,
  expectedFields?: Partial<ViewDTO | ViewEntity>,
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

export const assertViewFieldGroupStructure = (
  viewFieldGroup: ViewFieldGroupDTO,
  expectedFields?: Partial<ViewFieldGroupDTO>,
) => {
  expect(viewFieldGroup).toBeDefined();
  expect(viewFieldGroup.id).toBeDefined();
  expect(viewFieldGroup.name).toBeDefined();
  expect(viewFieldGroup.viewId).toBeDefined();
  expect(typeof viewFieldGroup.position).toBe('number');
  expect(typeof viewFieldGroup.isVisible).toBe('boolean');

  if (expectedFields) {
    expect(viewFieldGroup).toMatchObject(expectedFields);
  }
};

export const assertViewFieldStructure = (
  viewField: ViewFieldDTO,
  expectedFields?: Partial<ViewFieldDTO>,
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
  viewSort: ViewSortDTO,
  expectedFields?: Partial<ViewSortDTO>,
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
  viewFilter: ViewFilterDTO,
  expectedFields?: Partial<ViewFilterDTO>,
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
  viewGroup: ViewGroupDTO,
  expectedFields?: Partial<ViewGroupDTO>,
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
  viewFilterGroup: ViewFilterGroupDTO,
  expectedFields?: Partial<ViewFilterGroupDTO>,
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
