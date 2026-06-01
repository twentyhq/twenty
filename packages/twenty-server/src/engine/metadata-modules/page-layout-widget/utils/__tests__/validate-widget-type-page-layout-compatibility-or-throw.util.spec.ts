import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetTypePageLayoutCompatibilityOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-type-page-layout-compatibility-or-throw.util';

describe('validateWidgetTypePageLayoutCompatibilityOrThrow', () => {
  const applicationId = '20202020-37cd-4cbc-ac8c-608735f27031';
  const workspaceId = '20202020-7a0f-4329-b20b-f31bd8dc75e7';

  const buildFlatPageLayoutMaps = (pageLayoutType: PageLayoutType) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: '20202020-f77d-4de6-89f6-ee6d9787d1c6',
        universalIdentifier: 'page-layout-universal-id',
        applicationId,
        workspaceId,
        type: pageLayoutType,
      } as FlatPageLayout,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    });

  const buildFlatPageLayoutTabMaps = () =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: '20202020-f5aa-4ce6-a803-109a2de2280c',
        universalIdentifier: 'page-layout-tab-universal-id',
        applicationId,
        workspaceId,
        pageLayoutId: '20202020-f77d-4de6-89f6-ee6d9787d1c6',
      } as FlatPageLayoutTab,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    });

  it('should not throw when standalone rich text is created on dashboard page layouts', () => {
    expect(() =>
      validateWidgetTypePageLayoutCompatibilityOrThrow({
        widgetType: WidgetType.STANDALONE_RICH_TEXT,
        pageLayoutTabId: '20202020-f5aa-4ce6-a803-109a2de2280c',
        flatPageLayoutTabMaps: buildFlatPageLayoutTabMaps(),
        flatPageLayoutMaps: buildFlatPageLayoutMaps(PageLayoutType.DASHBOARD),
      }),
    ).not.toThrow();
  });

  it('should throw when standalone rich text is created on non-dashboard page layouts', () => {
    expect(() =>
      validateWidgetTypePageLayoutCompatibilityOrThrow({
        widgetType: WidgetType.STANDALONE_RICH_TEXT,
        pageLayoutTabId: '20202020-f5aa-4ce6-a803-109a2de2280c',
        flatPageLayoutTabMaps: buildFlatPageLayoutTabMaps(),
        flatPageLayoutMaps: buildFlatPageLayoutMaps(PageLayoutType.RECORD_PAGE),
      }),
    ).toThrow(
      expect.objectContaining({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      }),
    );
  });

  it('should not throw for non-standalone-rich-text widget types', () => {
    expect(() =>
      validateWidgetTypePageLayoutCompatibilityOrThrow({
        widgetType: WidgetType.FIELD,
        pageLayoutTabId: '20202020-f5aa-4ce6-a803-109a2de2280c',
        flatPageLayoutTabMaps: buildFlatPageLayoutTabMaps(),
        flatPageLayoutMaps: buildFlatPageLayoutMaps(PageLayoutType.RECORD_PAGE),
      }),
    ).not.toThrow();
  });
});
