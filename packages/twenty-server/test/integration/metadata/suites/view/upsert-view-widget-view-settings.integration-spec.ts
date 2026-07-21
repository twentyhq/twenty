import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-view-groups.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { upsertViewWidget } from 'test/integration/metadata/suites/view/utils/upsert-view-widget.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

const VIEW_SETTINGS_GQL_FIELDS = `
  id
  type
  mainGroupByFieldMetadataId
  shouldHideEmptyGroups
  kanbanAggregateOperation
  kanbanAggregateOperationFieldMetadataId
  calendarLayout
  calendarFieldMetadataId
  calendarEndFieldMetadataId
`;

describe('upsertViewWidget view settings', () => {
  let objectMetadataId: string;
  let selectFieldMetadataId: string;
  let dateFieldMetadataId: string;
  let pageLayoutId: string;
  let pageLayoutTabId: string;
  let widgetId: string;
  let viewId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: createdObjectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'widgetViewSettingsTestObject',
        namePlural: 'widgetViewSettingsTestObjects',
        labelSingular: 'Widget View Settings Test Object',
        labelPlural: 'Widget View Settings Test Objects',
        icon: 'IconTestTube',
      },
    });

    objectMetadataId = createdObjectMetadataId;

    const {
      data: {
        createOneField: { id: createdSelectFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'stage',
        type: FieldMetadataType.SELECT,
        label: 'Stage',
        objectMetadataId,
        options: [
          { label: 'New', value: 'NEW', color: 'blue', position: 0 },
          { label: 'Ongoing', value: 'ONGOING', color: 'red', position: 1 },
          { label: 'Done', value: 'DONE', color: 'green', position: 2 },
        ],
      },
      gqlFields: 'id',
    });

    selectFieldMetadataId = createdSelectFieldMetadataId;

    const {
      data: {
        createOneField: { id: createdDateFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'eventDate',
        type: FieldMetadataType.DATE,
        label: 'Event Date',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    dateFieldMetadataId = createdDateFieldMetadataId;

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For View Settings' },
    });

    pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For View Settings',
        pageLayoutId,
      },
    });

    pageLayoutTabId = tabData.createPageLayoutTab.id;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'testWidgetViewSettingsView',
        objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE_WIDGET,
      },
    });

    viewId = viewData.createView.id;

    const { data: widgetData } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Test Record Table Widget For View Settings',
        type: WidgetType.RECORD_TABLE,
        pageLayoutTabId,
        objectMetadataId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId,
        },
      },
    });

    widgetId = widgetData.createPageLayoutWidget.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });
    await destroyOneView({
      expectToFail: false,
      viewId,
    });
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('should reject a non-widget view type', async () => {
    const { errors } = await upsertViewWidget({
      expectToFail: true,
      input: {
        widgetId,
        view: {
          type: ViewType.KANBAN,
          mainGroupByFieldMetadataId: selectFieldMetadataId,
        },
      },
    });

    expect(errors?.[0]?.message).toContain(
      'Widget views must use a widget view type',
    );
  });

  it('should reject switching to KANBAN_WIDGET without a main group by field', async () => {
    const { errors } = await upsertViewWidget({
      expectToFail: true,
      input: {
        widgetId,
        view: {
          type: ViewType.KANBAN_WIDGET,
        },
      },
    });

    expect(JSON.stringify(errors)).toContain(
      'Kanban view must have a main group by field',
    );
  });

  it('should switch the widget view to KANBAN_WIDGET and auto-create view groups', async () => {
    const { data } = await upsertViewWidget({
      expectToFail: false,
      input: {
        widgetId,
        view: {
          type: ViewType.KANBAN_WIDGET,
          mainGroupByFieldMetadataId: selectFieldMetadataId,
        },
      },
      gqlFields: VIEW_SETTINGS_GQL_FIELDS,
    });

    expect(data.upsertViewWidget.type).toBe(ViewType.KANBAN_WIDGET);
    expect(data.upsertViewWidget.mainGroupByFieldMetadataId).toBe(
      selectFieldMetadataId,
    );

    const { data: viewGroupsData } = await findViewGroups({
      expectToFail: false,
      viewId,
    });

    const fieldValues = viewGroupsData.getViewGroups.map(
      (viewGroup) => viewGroup.fieldValue,
    );

    expect(fieldValues).toEqual(
      expect.arrayContaining(['NEW', 'ONGOING', 'DONE']),
    );
  });

  it('should reject switching to CALENDAR_WIDGET without a calendar field', async () => {
    const { errors } = await upsertViewWidget({
      expectToFail: true,
      input: {
        widgetId,
        view: {
          type: ViewType.CALENDAR_WIDGET,
          mainGroupByFieldMetadataId: null,
        },
      },
    });

    expect(JSON.stringify(errors)).toContain(
      'Calendar view must have a calendar field',
    );
  });

  it('should reject a non-month calendar layout on a CALENDAR_WIDGET view', async () => {
    // This suite shares its workspace with the rest of the shard, and the
    // "allow non-month" test below flips IS_CALENDAR_WEEK_VIEW_ENABLED on. Pin
    // it off here so the rejection path is exercised deterministically, whatever
    // the test/retry ordering leaves behind in the workspace.
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
      value: false,
      expectToFail: false,
    });

    const { errors } = await upsertViewWidget({
      expectToFail: true,
      input: {
        widgetId,
        view: {
          type: ViewType.CALENDAR_WIDGET,
          calendarLayout: ViewCalendarLayout.DAY,
          calendarFieldMetadataId: dateFieldMetadataId,
          mainGroupByFieldMetadataId: null,
        },
      },
    });

    expect(JSON.stringify(errors)).toContain(
      'Calendar widget views only support the month layout',
    );
  });

  it('should allow a non-month calendar layout on a CALENDAR_WIDGET view when the week/day calendar feature is enabled', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
      value: true,
      expectToFail: false,
    });

    try {
      const { data } = await upsertViewWidget({
        expectToFail: false,
        input: {
          widgetId,
          view: {
            type: ViewType.CALENDAR_WIDGET,
            calendarLayout: ViewCalendarLayout.WEEK,
            calendarFieldMetadataId: dateFieldMetadataId,
            mainGroupByFieldMetadataId: null,
          },
        },
        gqlFields: VIEW_SETTINGS_GQL_FIELDS,
      });

      expect(data.upsertViewWidget.type).toBe(ViewType.CALENDAR_WIDGET);
      expect(data.upsertViewWidget.calendarLayout).toBe(
        ViewCalendarLayout.WEEK,
      );
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should switch the widget view to CALENDAR_WIDGET with a date field and layout', async () => {
    const { data } = await upsertViewWidget({
      expectToFail: false,
      input: {
        widgetId,
        view: {
          type: ViewType.CALENDAR_WIDGET,
          calendarLayout: ViewCalendarLayout.MONTH,
          calendarFieldMetadataId: dateFieldMetadataId,
          mainGroupByFieldMetadataId: null,
        },
      },
      gqlFields: VIEW_SETTINGS_GQL_FIELDS,
    });

    expect(data.upsertViewWidget.type).toBe(ViewType.CALENDAR_WIDGET);
    expect(data.upsertViewWidget.calendarLayout).toBe(ViewCalendarLayout.MONTH);
    expect(data.upsertViewWidget.calendarFieldMetadataId).toBe(
      dateFieldMetadataId,
    );

    const { data: viewGroupsData } = await findViewGroups({
      expectToFail: false,
      viewId,
    });

    expect(viewGroupsData.getViewGroups).toHaveLength(0);
  });

  it('should switch the widget view back to TABLE_WIDGET', async () => {
    const { data } = await upsertViewWidget({
      expectToFail: false,
      input: {
        widgetId,
        view: {
          type: ViewType.TABLE_WIDGET,
        },
      },
      gqlFields: VIEW_SETTINGS_GQL_FIELDS,
    });

    expect(data.upsertViewWidget.type).toBe(ViewType.TABLE_WIDGET);
  });

  it('should update view settings and view fields in a single call', async () => {
    const { data } = await upsertViewWidget({
      expectToFail: false,
      input: {
        widgetId,
        view: {
          type: ViewType.KANBAN_WIDGET,
          mainGroupByFieldMetadataId: selectFieldMetadataId,
          shouldHideEmptyGroups: true,
        },
        viewFields: [
          {
            fieldMetadataId: selectFieldMetadataId,
            isVisible: true,
            position: 0,
          },
        ],
      },
      gqlFields: `
        ${VIEW_SETTINGS_GQL_FIELDS}
        viewFields {
          id
          fieldMetadataId
          isVisible
        }
      `,
    });

    expect(data.upsertViewWidget.type).toBe(ViewType.KANBAN_WIDGET);
    expect(data.upsertViewWidget.shouldHideEmptyGroups).toBe(true);
    expect(
      (data.upsertViewWidget.viewFields ?? []).some(
        (viewField) => viewField.fieldMetadataId === selectFieldMetadataId,
      ),
    ).toBe(true);
  });
});
