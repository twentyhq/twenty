import { createOneViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/create-one-view-field-group.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findViewChildIds } from 'test/integration/metadata/suites/view/utils/find-view-child-ids.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  type ViewVisibility,
} from 'twenty-shared/types';

export const createViewWithChildren = async ({
  name,
  visibility,
  token,
}: {
  name: string;
  visibility: ViewVisibility;
  token?: string;
}): Promise<{ viewId: string; childIdByChildName: Record<string, string> }> => {
  const objectMetadataId = await findObjectMetadataIdByName('opportunity');

  const [nameFieldMetadataId, stageFieldMetadataId, closeDateFieldMetadataId] =
    await Promise.all(
      ['name', 'stage', 'closeDate'].map((fieldName) =>
        findFieldMetadataIdByName({ objectMetadataId, fieldName }),
      ),
    );

  const {
    data: {
      createView: { id: viewId },
    },
  } = await createOneView({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      name,
      objectMetadataId,
      icon: 'IconTable',
      type: ViewType.TABLE,
      visibility,
      mainGroupByFieldMetadataId: stageFieldMetadataId,
    },
  });

  const { data: viewFieldData } = await createOneViewField({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      viewId,
      fieldMetadataId: closeDateFieldMetadataId,
      position: 1,
      isVisible: true,
      size: 150,
    },
  });

  const { data: viewFilterGroupData } = await createOneViewFilterGroup({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      viewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      positionInViewFilterGroup: 0,
    },
  });

  const { data: viewFilterData } = await createOneViewFilter({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      viewId,
      viewFilterGroupId: viewFilterGroupData.createViewFilterGroup.id,
      fieldMetadataId: nameFieldMetadataId,
      operand: ViewFilterOperand.CONTAINS,
      value: 'private',
      positionInViewFilterGroup: 0,
    },
  });

  const { data: viewSortData } = await createOneViewSort({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      viewId,
      fieldMetadataId: nameFieldMetadataId,
      direction: ViewSortDirection.ASC,
    },
  });

  const { data: viewFieldGroupData } = await createOneViewFieldGroup({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: { viewId, name: 'Private group', position: 1, isVisible: true },
  });

  const [firstViewGroupId] = await findViewChildIds({
    listQueryName: 'getViewGroups',
    viewId,
    token,
  });

  jestExpectToBeDefined(firstViewGroupId);

  return {
    viewId,
    childIdByChildName: {
      'view field': viewFieldData.createViewField.id,
      'view filter': viewFilterData.createViewFilter.id,
      'view sort': viewSortData.createViewSort.id,
      'view group': firstViewGroupId,
      'view filter group': viewFilterGroupData.createViewFilterGroup.id,
      'view field group': viewFieldGroupData.createViewFieldGroup.id,
    },
  };
};
