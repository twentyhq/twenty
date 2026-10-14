import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { deleteOneView } from 'test/integration/metadata/suites/view/utils/delete-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
  WidgetType,
} from 'twenty-shared/types';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const DEFAULT_GRID_POSITION = {
  layoutMode: PageLayoutTabLayoutMode.GRID as const,
  row: 0,
  column: 0,
  rowSpan: 4,
  columnSpan: 6,
};

const createTestObject = async (nameSingular: string) => {
  const {
    data: {
      createOneObject: { id },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular,
      namePlural: `${nameSingular}s`,
      labelSingular: nameSingular,
      labelPlural: `${nameSingular}s`,
      icon: 'IconBox',
    },
  });

  return id;
};

const destroyTestObject = async (objectMetadataId: string) => {
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
};

describe('VIEW page layout widget referencing an existing view', () => {
  let objectMetadataId: string;
  let otherObjectMetadataId: string;
  let pageLayoutId: string;
  let pageLayoutTabId: string;
  const viewIdsByName: Record<string, string> = {};

  const createView = async (
    name: string,
    input: {
      type: ViewType;
      objectMetadataId: string;
      visibility?: ViewVisibility;
      mainGroupByFieldMetadataId?: string;
      calendarFieldMetadataId?: string;
      calendarLayout?: ViewCalendarLayout;
    },
  ) => {
    const { data } = await createOneView({
      expectToFail: false,
      input: { name, icon: 'IconTable', ...input },
      gqlFields: 'id',
    });

    viewIdsByName[name] = data.createView.id;

    return data.createView.id;
  };

  const buildViewWidgetInput = (
    viewId: string | undefined,
    widgetObjectMetadataId = objectMetadataId,
  ): CreatePageLayoutWidgetInput =>
    ({
      title: 'View widget',
      pageLayoutTabId,
      type: WidgetType.VIEW,
      objectMetadataId: widgetObjectMetadataId,
      position: DEFAULT_GRID_POSITION,
      configuration: {
        configurationType: WidgetConfigurationType.VIEW,
        viewId,
      },
    }) as CreatePageLayoutWidgetInput;

  beforeAll(async () => {
    objectMetadataId = await createTestObject('viewWidgetTestObject');
    otherObjectMetadataId = await createTestObject('viewWidgetOtherObject');

    const {
      data: {
        createOneField: { id: selectFieldMetadataId },
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
          { label: 'Done', value: 'DONE', color: 'green', position: 1 },
        ],
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: dateFieldMetadataId },
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

    await createView('table', { type: ViewType.TABLE, objectMetadataId });
    await createView('kanban', {
      type: ViewType.KANBAN,
      objectMetadataId,
      mainGroupByFieldMetadataId: selectFieldMetadataId,
    });
    await createView('list', { type: ViewType.LIST, objectMetadataId });
    await createView('calendar', {
      type: ViewType.CALENDAR,
      objectMetadataId,
      calendarFieldMetadataId: dateFieldMetadataId,
      calendarLayout: ViewCalendarLayout.MONTH,
    });
    await createView('widgetOwned', {
      type: ViewType.TABLE_WIDGET,
      objectMetadataId,
    });
    await createView('unlisted', {
      type: ViewType.TABLE,
      objectMetadataId,
      visibility: ViewVisibility.UNLISTED,
    });
    await createView('otherObject', {
      type: ViewType.TABLE,
      objectMetadataId: otherObjectMetadataId,
    });
    await createView('softDeleted', {
      type: ViewType.TABLE,
      objectMetadataId,
    });
    await deleteOneView({
      expectToFail: false,
      viewId: viewIdsByName.softDeleted,
    });

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For View Widgets' },
    });

    pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: { title: 'Test Tab For View Widgets', pageLayoutId },
    });

    pageLayoutTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });

    for (const viewId of Object.values(viewIdsByName)) {
      await destroyOneView({ viewId });
    }

    await destroyTestObject(objectMetadataId);
    await destroyTestObject(otherObjectMetadataId);
  });

  it.each(['table', 'kanban', 'list', 'calendar'])(
    'should create a widget referencing a %s view and keep the view when the widget is destroyed',
    async (viewName) => {
      const viewId = viewIdsByName[viewName];

      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: buildViewWidgetInput(viewId),
      });

      expect(data.createPageLayoutWidget.configuration).toEqual({
        configurationType: WidgetConfigurationType.VIEW,
        viewId,
      });

      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: data.createPageLayoutWidget.id },
      });

      const { data: viewData } = await findOneView({
        viewId,
        gqlFields: 'id',
      });

      expect(viewData.getView?.id).toBe(viewId);
    },
  );

  it.each([
    ['viewId is missing', () => undefined, 'viewId'],
    [
      'the view does not exist',
      () => '20202020-0000-4000-8000-0000000000aa',
      'not found',
    ],
    ['the view is deleted', () => viewIdsByName.softDeleted, 'not found'],
    [
      'the view belongs to another object',
      () => viewIdsByName.otherObject,
      'does not belong to objectMetadataId',
    ],
    [
      'the view is owned by a widget',
      () => viewIdsByName.widgetOwned,
      'owned by a widget',
    ],
    [
      'the view is not shared with the workspace',
      () => viewIdsByName.unlisted,
      'not shared with the workspace',
    ],
  ])('should fail when %s', async (_, getViewId, expectedMessage) => {
    const { errors } = await createOnePageLayoutWidget({
      expectToFail: true,
      input: buildViewWidgetInput(getViewId()),
    });

    expect(errors).toHaveLength(1);
    expect(JSON.stringify(errors[0])).toContain(expectedMessage);
  });

  it('should fail when the widget object is changed away from the view object', async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: buildViewWidgetInput(viewIdsByName.table),
    });

    const widgetId = data.createPageLayoutWidget.id;

    const { errors } = await updateOnePageLayoutWidget({
      expectToFail: true,
      input: { id: widgetId, objectMetadataId: otherObjectMetadataId },
    });

    expect(JSON.stringify(errors?.[0])).toContain(
      'does not belong to objectMetadataId',
    );

    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });
  });
});
