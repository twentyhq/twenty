import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const LAYOUT_NAME = 'Viewport batch validation';

describe('Tab viewport widgets in metadata mutation batches', () => {
  let pageLayoutId: string;
  let pageLayoutTabId: string;
  let viewportWidgetId: string;

  const buildWidget = ({
    id = v4(),
    index,
    heightBehavior = PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
  }: {
    id?: string;
    index: number;
    heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  }): UpdatePageLayoutWidgetWithIdInput => ({
    id,
    pageLayoutTabId,
    title: 'Iframe widget',
    type: WidgetType.IFRAME,
    objectMetadataId: null,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
      heightBehavior,
    },
    configuration: { configurationType: WidgetConfigurationType.IFRAME },
  });

  const saveWidgets = async (widgets: UpdatePageLayoutWidgetWithIdInput[]) => {
    const { data, errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: pageLayoutId,
        name: LAYOUT_NAME,
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: pageLayoutTabId,
            title: 'Overview',
            position: 0,
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            widgets,
          },
        ],
      },
    });

    expect(errors).toBeUndefined();
    return data.updatePageLayoutWithTabsAndWidgets.tabs?.[0].widgets;
  };

  beforeEach(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: LAYOUT_NAME, type: PageLayoutType.RECORD_PAGE },
    });
    pageLayoutId = layoutData.createPageLayout.id;
    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Overview',
        pageLayoutId,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      },
    });
    pageLayoutTabId = tabData.createPageLayoutTab.id;
    viewportWidgetId = v4();
    await saveWidgets([
      buildWidget({
        id: viewportWidgetId,
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
    ]);
  });

  afterEach(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('creates content above a viewport reindexed in the same save', async () => {
    const content = buildWidget({ index: 0 });
    const viewport = buildWidget({
      id: viewportWidgetId,
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const widgets = await saveWidgets([content, viewport]);
    expect(widgets).toHaveLength(2);
    expect(widgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: content.id, position: content.position }),
        expect.objectContaining({
          id: viewport.id,
          position: viewport.position,
        }),
      ]),
    );
  });

  it('creates a viewport while the existing viewport becomes fit-content', async () => {
    const content = buildWidget({ id: viewportWidgetId, index: 0 });
    const viewport = buildWidget({
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const widgets = await saveWidgets([content, viewport]);
    expect(widgets).toHaveLength(2);
    expect(widgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: content.id, position: content.position }),
        expect.objectContaining({
          id: viewport.id,
          position: viewport.position,
        }),
      ]),
    );
  });

  it('transfers viewport height between existing widgets in one save', async () => {
    const contentId = v4();
    await saveWidgets([
      buildWidget({ id: contentId, index: 0 }),
      buildWidget({
        id: viewportWidgetId,
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
    ]);
    const content = buildWidget({ id: viewportWidgetId, index: 0 });
    const viewport = buildWidget({
      id: contentId,
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const widgets = await saveWidgets([content, viewport]);
    expect(widgets).toHaveLength(2);
    expect(widgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: content.id, position: content.position }),
        expect.objectContaining({
          id: viewport.id,
          position: viewport.position,
        }),
      ]),
    );
  });

  it('replaces a viewport deleted in the same save', async () => {
    const replacement = buildWidget({
      index: 0,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const widgets = await saveWidgets([replacement]);
    expect(widgets).toEqual([
      expect.objectContaining({
        id: replacement.id,
        position: replacement.position,
      }),
    ]);
  });

  it('keeps untouched viewport siblings when validating a single creation', async () => {
    const { id: _id, ...input } = buildWidget({
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const { errors } = await createOnePageLayoutWidget({
      expectToFail: true,
      input,
    });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'METADATA_VALIDATION_FAILED',
            userFriendlyMessage:
              'Only one full-height widget is allowed per tab',
          }),
        }),
      ]),
    );
  });

  it('keeps untouched viewport siblings when validating a single update', async () => {
    const content = buildWidget({ index: 0 });
    await saveWidgets([
      content,
      buildWidget({
        id: viewportWidgetId,
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
    ]);
    const { errors } = await updateOnePageLayoutWidget({
      expectToFail: true,
      input: {
        id: content.id,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        },
      },
    });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'METADATA_VALIDATION_FAILED',
            userFriendlyMessage:
              'Only one full-height widget is allowed per tab',
          }),
        }),
      ]),
    );
  });
});
