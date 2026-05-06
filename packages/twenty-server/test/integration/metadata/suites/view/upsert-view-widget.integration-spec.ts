import {
  VIEW_FIELD_GQL_FIELDS,
  VIEW_FILTER_GQL_FIELDS,
  VIEW_FILTER_GROUP_GQL_FIELDS,
  VIEW_GQL_FIELDS,
  VIEW_SORT_GQL_FIELDS,
} from 'test/integration/constants/view-gql-fields.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import {
  fetchTestFieldMetadataIds,
  type TestFieldMetadataIds,
} from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { upsertViewWidget } from 'test/integration/metadata/suites/view/utils/upsert-view-widget.util';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

type ViewWidgetTestSetup = {
  pageLayoutId: string;
  pageLayoutTabId: string;
  widgetId: string;
  viewId: string;
  labelIdentifierFieldMetadataId: string | null;
  viewFields: Array<{
    id: string;
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
  }>;
  fieldMetadataIds: string[];
};

const VIEW_WITH_ALL_RELATIONS_GQL_FIELDS = `
  ${VIEW_GQL_FIELDS}
  viewFields {
    ${VIEW_FIELD_GQL_FIELDS}
  }
  viewFilters {
    ${VIEW_FILTER_GQL_FIELDS}
  }
  viewFilterGroups {
    ${VIEW_FILTER_GROUP_GQL_FIELDS}
  }
  viewSorts {
    ${VIEW_SORT_GQL_FIELDS}
  }
`;

describe('upsertViewWidget', () => {
  let testSetup: ViewWidgetTestSetup;

  beforeAll(async () => {
    const testFieldMetadataIds: TestFieldMetadataIds =
      await fetchTestFieldMetadataIds();

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For View Widget' },
    });

    const pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For View Widget',
        pageLayoutId,
      },
    });

    const pageLayoutTabId = tabData.createPageLayoutTab.id;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'testViewWidgetView',
        objectMetadataId: testFieldMetadataIds.objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE,
      },
    });

    const viewId = viewData.createView.id;

    const { data: widgetData } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Test Record Table Widget',
        type: WidgetType.RECORD_TABLE,
        pageLayoutTabId,
        objectMetadataId: testFieldMetadataIds.objectMetadataId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId,
        },
      },
    });

    const widgetId = widgetData.createPageLayoutWidget.id;

    const objectMetadataRows = await global.testDataSource.query(
      `SELECT "labelIdentifierFieldMetadataId"
       FROM core."objectMetadata"
       WHERE id = $1`,
      [testFieldMetadataIds.objectMetadataId],
    );

    const labelIdentifierFieldMetadataId =
      objectMetadataRows[0]?.labelIdentifierFieldMetadataId ?? null;

    const allFieldMetadataRows = await global.testDataSource.query(
      `SELECT id FROM core."fieldMetadata"
       WHERE "objectMetadataId" = $1
         AND "isActive" = true
       ORDER BY id
       LIMIT 10`,
      [testFieldMetadataIds.objectMetadataId],
    );

    const allFieldMetadataIds: string[] = allFieldMetadataRows.map(
      (row: { id: string }) => row.id,
    );

    if (labelIdentifierFieldMetadataId) {
      const idx = allFieldMetadataIds.indexOf(labelIdentifierFieldMetadataId);

      if (idx > 0) {
        allFieldMetadataIds.splice(idx, 1);
        allFieldMetadataIds.unshift(labelIdentifierFieldMetadataId);
      } else if (idx === -1) {
        allFieldMetadataIds.unshift(labelIdentifierFieldMetadataId);
      }
    }

    const seedFieldMetadataIds = allFieldMetadataIds.slice(0, 3);

    await upsertViewWidget({
      expectToFail: false,
      input: {
        widgetId,
        viewFields: seedFieldMetadataIds.map((fmId, index) => ({
          fieldMetadataId: fmId,
          isVisible: true,
          position: index,
        })),
      },
    });

    const { data: fieldsData } = await findViewFields({
      viewId,
      gqlFields: 'id fieldMetadataId position isVisible',
      expectToFail: false,
    });

    testSetup = {
      pageLayoutId,
      pageLayoutTabId,
      widgetId,
      viewId,
      labelIdentifierFieldMetadataId,
      viewFields: fieldsData.getViewFields,
      fieldMetadataIds: allFieldMetadataIds,
    };
  });

  afterAll(async () => {
    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: testSetup.widgetId },
    });
    await destroyOneView({
      expectToFail: false,
      viewId: testSetup.viewId,
    });
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testSetup.pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testSetup.pageLayoutId },
    });
  });

  describe('view fields', () => {
    it('should create a new view field via fieldMetadataId', async () => {
      const existingFieldMetadataIds = new Set(
        testSetup.viewFields.map((f) => f.fieldMetadataId),
      );
      const newFieldMetadataId = testSetup.fieldMetadataIds.find(
        (id) => !existingFieldMetadataIds.has(id),
      );

      expect(newFieldMetadataId).toBeDefined();

      const { data, errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFields: [
            ...testSetup.viewFields.map((f) => ({
              viewFieldId: f.id,
              fieldMetadataId: f.fieldMetadataId,
              isVisible: f.isVisible,
              position: f.position,
            })),
            {
              fieldMetadataId: newFieldMetadataId!,
              isVisible: true,
              position: 99,
            },
          ],
        },
        gqlFields: VIEW_WITH_ALL_RELATIONS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertViewWidget).toBeDefined();

      const { data: fieldsData } = await findViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id fieldMetadataId position isVisible',
        expectToFail: false,
      });

      const createdField = fieldsData.getViewFields.find(
        (f: { fieldMetadataId: string }) =>
          f.fieldMetadataId === newFieldMetadataId!,
      );

      expect(createdField).toBeDefined();
      expect(createdField!.isVisible).toBe(true);
      expect(createdField!.position).toBe(99);
    });

    it('should update an existing view field position and visibility', async () => {
      const targetField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId !== testSetup.labelIdentifierFieldMetadataId,
      )!;

      expect(targetField).toBeDefined();

      const labelIdentifierField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId === testSetup.labelIdentifierFieldMetadataId,
      );

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFields: [
            ...(labelIdentifierField
              ? [
                  {
                    viewFieldId: labelIdentifierField.id,
                    fieldMetadataId: labelIdentifierField.fieldMetadataId,
                    isVisible: true,
                    position: 0,
                  },
                ]
              : []),
            {
              viewFieldId: targetField.id,
              fieldMetadataId: targetField.fieldMetadataId,
              isVisible: false,
              position: 42,
            },
          ],
        },
      });

      const { data: fieldsData } = await findViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id isVisible position',
        expectToFail: false,
      });

      const updatedField = fieldsData.getViewFields.find(
        (f: { id: string }) => f.id === targetField.id,
      );

      expect(updatedField).toBeDefined();
      expect(updatedField!.isVisible).toBe(false);
      expect(updatedField!.position).toBe(42);
    });

    it('should not modify fields when viewFields is omitted', async () => {
      const { data: fieldsBefore } = await findViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id position isVisible',
        expectToFail: false,
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [],
        },
      });

      const { data: fieldsAfter } = await findViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id position isVisible',
        expectToFail: false,
      });

      expect(fieldsAfter.getViewFields.length).toBe(
        fieldsBefore.getViewFields.length,
      );
    });
  });

  describe('view filter groups', () => {
    it('should create a new filter group', async () => {
      const filterGroupId = uuidv4();

      const { data, errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
        },
        gqlFields: VIEW_WITH_ALL_RELATIONS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertViewWidget).toBeDefined();

      const filterGroups = await global.testDataSource.query(
        `SELECT id, "logicalOperator"
         FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [filterGroupId],
      );

      expect(filterGroups.length).toBe(1);
      expect(filterGroups[0].logicalOperator).toBe(
        ViewFilterGroupLogicalOperator.AND,
      );
    });

    it('should update an existing filter group logical operator', async () => {
      const filterGroupId = uuidv4();

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
        },
      });

      const filterGroups = await global.testDataSource.query(
        `SELECT id, "logicalOperator"
         FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [filterGroupId],
      );

      expect(filterGroups.length).toBe(1);
      expect(filterGroups[0].logicalOperator).toBe(
        ViewFilterGroupLogicalOperator.OR,
      );
    });

    it('should remove filter groups not included in the input', async () => {
      const groupToKeepId = uuidv4();
      const groupToRemoveId = uuidv4();

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: groupToKeepId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
            {
              id: groupToRemoveId,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: groupToKeepId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
        },
      });

      const removedGroup = await global.testDataSource.query(
        `SELECT id FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [groupToRemoveId],
      );

      expect(removedGroup.length).toBe(0);

      const keptGroup = await global.testDataSource.query(
        `SELECT id FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [groupToKeepId],
      );

      expect(keptGroup.length).toBe(1);
    });

    it('should create a nested filter group with parent reference', async () => {
      const parentGroupId = uuidv4();
      const childGroupId = uuidv4();

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: parentGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
        },
      });

      const { errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: parentGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
            {
              id: childGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
              parentViewFilterGroupId: parentGroupId,
            },
          ],
        },
      });

      expect(errors).toBeUndefined();

      const childGroup = await global.testDataSource.query(
        `SELECT id, "parentViewFilterGroupId"
         FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [childGroupId],
      );

      expect(childGroup.length).toBe(1);
      expect(childGroup[0].parentViewFilterGroupId).toBe(parentGroupId);
    });
  });

  describe('view filters', () => {
    it('should create a new filter', async () => {
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      const { data, errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'test-value',
            },
          ],
        },
        gqlFields: VIEW_WITH_ALL_RELATIONS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertViewWidget).toBeDefined();

      const { data: filtersData } = await findViewFilters({
        viewId: testSetup.viewId,
        gqlFields: 'id fieldMetadataId operand value',
        expectToFail: false,
      });

      const createdFilter = filtersData.getViewFilters.find(
        (f: { fieldMetadataId: string; value: unknown }) =>
          f.fieldMetadataId === fieldMetadataId && f.value === 'test-value',
      );

      expect(createdFilter).toBeDefined();
      expect(createdFilter!.operand).toBe(ViewFilterOperand.CONTAINS);
    });

    it('should update an existing filter value and operand', async () => {
      const filterId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              id: filterId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'initial',
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              id: filterId,
              fieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: 'updated',
            },
          ],
        },
      });

      const { data: filtersData } = await findViewFilters({
        viewId: testSetup.viewId,
        gqlFields: 'id operand value',
        expectToFail: false,
      });

      const updatedFilter = filtersData.getViewFilters.find(
        (f: { id: string }) => f.id === filterId,
      );

      expect(updatedFilter).toBeDefined();
      expect(updatedFilter!.operand).toBe(ViewFilterOperand.IS);
      expect(updatedFilter!.value).toBe('updated');
    });

    it('should remove filters not included in the input', async () => {
      const filterToKeepId = uuidv4();
      const filterToRemoveId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              id: filterToKeepId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'keep',
            },
            {
              id: filterToRemoveId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'remove',
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              id: filterToKeepId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'keep',
            },
          ],
        },
      });

      const { data: filtersData } = await findViewFilters({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      const keptFilter = filtersData.getViewFilters.find(
        (f: { id: string }) => f.id === filterToKeepId,
      );

      expect(keptFilter).toBeDefined();

      const removedFilter = filtersData.getViewFilters.find(
        (f: { id: string }) => f.id === filterToRemoveId,
      );

      expect(removedFilter).toBeUndefined();
    });

    it('should create a filter within a filter group', async () => {
      const filterGroupId = uuidv4();
      const filterId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
          viewFilters: [
            {
              id: filterId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'grouped-filter',
              viewFilterGroupId: filterGroupId,
            },
          ],
        },
      });

      const filters = await global.testDataSource.query(
        `SELECT id, "viewFilterGroupId"
         FROM core."viewFilter"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [filterId],
      );

      expect(filters.length).toBe(1);
      expect(filters[0].viewFilterGroupId).toBe(filterGroupId);
    });
  });

  describe('view sorts', () => {
    afterEach(async () => {
      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [],
        },
      });
    });

    it('should create a new sort', async () => {
      const sortId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId,
              direction: ViewSortDirection.DESC,
            },
          ],
        },
      });

      const sorts = await global.testDataSource.query(
        `SELECT id, "fieldMetadataId", direction
         FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortId],
      );

      expect(sorts.length).toBe(1);
      expect(sorts[0].fieldMetadataId).toBe(fieldMetadataId);
      expect(sorts[0].direction).toBe(ViewSortDirection.DESC);
    });

    it('should update an existing sort direction', async () => {
      const sortId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[1];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId,
              direction: ViewSortDirection.ASC,
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId,
              direction: ViewSortDirection.DESC,
            },
          ],
        },
      });

      const sorts = await global.testDataSource.query(
        `SELECT id, direction
         FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortId],
      );

      expect(sorts.length).toBe(1);
      expect(sorts[0].direction).toBe(ViewSortDirection.DESC);
    });

    it('should remove sorts not included in the input', async () => {
      const sortToKeepId = uuidv4();
      const sortToRemoveId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];
      const secondFieldMetadataId = testSetup.fieldMetadataIds[1];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortToKeepId,
              fieldMetadataId,
              direction: ViewSortDirection.ASC,
            },
            {
              id: sortToRemoveId,
              fieldMetadataId: secondFieldMetadataId,
              direction: ViewSortDirection.DESC,
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortToKeepId,
              fieldMetadataId,
              direction: ViewSortDirection.ASC,
            },
          ],
        },
      });

      const keptSort = await global.testDataSource.query(
        `SELECT id FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortToKeepId],
      );

      expect(keptSort.length).toBe(1);

      const removedSort = await global.testDataSource.query(
        `SELECT id FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortToRemoveId],
      );

      expect(removedSort.length).toBe(0);
    });
  });

  describe('combined operations', () => {
    it('should upsert view fields, filters, filter groups, and sorts in a single call', async () => {
      const filterGroupId = uuidv4();
      const filterId = uuidv4();
      const sortId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[2];
      const targetField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId !== testSetup.labelIdentifierFieldMetadataId,
      )!;

      expect(targetField).toBeDefined();

      const labelIdentifierField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId === testSetup.labelIdentifierFieldMetadataId,
      );

      const { data, errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFields: [
            ...(labelIdentifierField
              ? [
                  {
                    viewFieldId: labelIdentifierField.id,
                    fieldMetadataId: labelIdentifierField.fieldMetadataId,
                    isVisible: true,
                    position: 0,
                  },
                ]
              : []),
            {
              viewFieldId: targetField.id,
              fieldMetadataId: targetField.fieldMetadataId,
              isVisible: true,
              position: 1,
            },
          ],
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
          viewFilters: [
            {
              id: filterId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'combined-test',
              viewFilterGroupId: filterGroupId,
            },
          ],
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId,
              direction: ViewSortDirection.DESC,
            },
          ],
        },
        gqlFields: VIEW_WITH_ALL_RELATIONS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertViewWidget).toBeDefined();
      expect(data.upsertViewWidget.id).toBeDefined();

      const filterGroups = await global.testDataSource.query(
        `SELECT id FROM core."viewFilterGroup"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [filterGroupId],
      );

      expect(filterGroups.length).toBe(1);

      const filters = await global.testDataSource.query(
        `SELECT id, value FROM core."viewFilter"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [filterId],
      );

      expect(filters.length).toBe(1);
      expect(filters[0].value).toBe('combined-test');

      const sorts = await global.testDataSource.query(
        `SELECT id, direction FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortId],
      );

      expect(sorts.length).toBe(1);
      expect(sorts[0].direction).toBe(ViewSortDirection.DESC);

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [],
          viewFilters: [],
          viewFilterGroups: [],
        },
      });
    });
  });

  describe('validation', () => {
    it('should fail when widget id does not exist', async () => {
      const { errors } = await upsertViewWidget({
        expectToFail: true,
        input: {
          widgetId: uuidv4(),
          viewFields: [
            {
              fieldMetadataId: testSetup.fieldMetadataIds[0],
              isVisible: true,
              position: 0,
            },
          ],
        },
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return the view without changes when no sub-entity arrays are provided', async () => {
      const { data, errors } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
        },
        gqlFields: VIEW_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertViewWidget).toBeDefined();
      expect(data.upsertViewWidget.id).toBeDefined();
    });

    it('should remove all filters when an empty array is provided', async () => {
      const filterId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[0];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [
            {
              id: filterId,
              fieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'to-be-removed',
            },
          ],
        },
      });

      const { data: filtersBefore } = await findViewFilters({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      const filterExistsBefore = filtersBefore.getViewFilters.find(
        (f: { id: string }) => f.id === filterId,
      );

      expect(filterExistsBefore).toBeDefined();

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFilters: [],
        },
      });

      const { data: filtersAfter } = await findViewFilters({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      const filterExistsAfter = filtersAfter.getViewFilters.find(
        (f: { id: string }) => f.id === filterId,
      );

      expect(filterExistsAfter).toBeUndefined();
    });

    it('should remove all sorts when an empty array is provided', async () => {
      const sortId = uuidv4();
      const fieldMetadataId = testSetup.fieldMetadataIds[3];

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId,
              direction: ViewSortDirection.ASC,
            },
          ],
        },
      });

      await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewSorts: [],
        },
      });

      const sortsAfter = await global.testDataSource.query(
        `SELECT id FROM core."viewSort"
         WHERE id = $1 AND "deletedAt" IS NULL`,
        [sortId],
      );

      expect(sortsAfter.length).toBe(0);
    });
  });

  describe('return type', () => {
    it('should return a view with the expected fields and relations', async () => {
      const targetField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId !== testSetup.labelIdentifierFieldMetadataId,
      )!;

      expect(targetField).toBeDefined();

      const labelIdentifierField = testSetup.viewFields.find(
        (field) =>
          field.fieldMetadataId === testSetup.labelIdentifierFieldMetadataId,
      );

      const { data } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          viewFields: [
            ...(labelIdentifierField
              ? [
                  {
                    viewFieldId: labelIdentifierField.id,
                    fieldMetadataId: labelIdentifierField.fieldMetadataId,
                    isVisible: true,
                    position: 0,
                  },
                ]
              : []),
            {
              viewFieldId: targetField.id,
              fieldMetadataId: targetField.fieldMetadataId,
              isVisible: true,
              position: 1,
            },
          ],
        },
        gqlFields: VIEW_WITH_ALL_RELATIONS_GQL_FIELDS,
      });

      const view = data.upsertViewWidget;

      expect(view.id).toBeDefined();
      expect(view.name).toBeDefined();
      expect(view.objectMetadataId).toBeDefined();
      expect(view.workspaceId).toBeDefined();
      expect(view.createdAt).toBeDefined();
      expect(view.updatedAt).toBeDefined();
      expect(Array.isArray(view.viewFields)).toBe(true);
      expect(Array.isArray(view.viewFilters)).toBe(true);
      expect(Array.isArray(view.viewFilterGroups)).toBe(true);
      expect(Array.isArray(view.viewSorts)).toBe(true);
    });
  });
});
