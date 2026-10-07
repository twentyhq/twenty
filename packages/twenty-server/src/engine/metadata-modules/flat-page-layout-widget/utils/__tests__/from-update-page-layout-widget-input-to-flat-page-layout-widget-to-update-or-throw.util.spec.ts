import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-update-page-layout-widget-input-to-flat-page-layout-widget-to-update-or-throw.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-bbbb-4bbb-8bbb-000000000002';
const WIDGET_ID = '20202020-cccc-4ccc-8ccc-000000000003';

const EMPTY_FLAT_ENTITY_MAPS = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const buildFormFieldWidget = (
  overrides: Partial<FlatPageLayoutWidget>,
): FlatPageLayoutWidget =>
  ({
    id: WIDGET_ID,
    universalIdentifier: WIDGET_ID,
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    pageLayoutTabId: 'tab-id',
    pageLayoutTabUniversalIdentifier: 'tab-universal-identifier',
    title: '',
    type: WidgetType.FORM_FIELD,
    position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 2 },
    configuration: {
      configurationType: WidgetConfigurationType.FORM_FIELD,
      fieldMetadataId: 'field-id',
    },
    isActive: true,
    isSystemSideEffect: true,
    overrides: null,
    universalOverrides: null,
    ...overrides,
  }) as FlatPageLayoutWidget;

const updateWidget = ({
  existingWidget,
  isActive,
}: {
  existingWidget: FlatPageLayoutWidget;
  isActive: boolean;
}) =>
  fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow({
    updatePageLayoutWidgetInput: { id: WIDGET_ID, update: { isActive } },
    flatPageLayoutWidgetMaps: {
      byUniversalIdentifier: { [WIDGET_ID]: existingWidget },
      universalIdentifierById: { [WIDGET_ID]: WIDGET_ID },
      universalIdentifiersByApplicationId: {},
    },
    flatObjectMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
    flatFieldMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
    flatFrontComponentMaps: EMPTY_FLAT_ENTITY_MAPS,
    flatViewFieldGroupMaps: EMPTY_FLAT_ENTITY_MAPS,
    flatViewMaps: EMPTY_FLAT_ENTITY_MAPS,
    flatPageLayoutTabMaps: EMPTY_FLAT_ENTITY_MAPS,
    callerApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow', () => {
  it('stores a hidden engine-owned widget as a workspace override and keeps its column and position', () => {
    const updatedWidget = updateWidget({
      existingWidget: buildFormFieldWidget({}),
      isActive: false,
    });

    expect(updatedWidget.isActive).toBe(true);
    expect(updatedWidget.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 2,
    });
    expect(updatedWidget.overrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { isActive: false },
    });
    expect(updatedWidget.universalOverrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { isActive: false },
    });
  });

  it('drops the override when the widget is shown again', () => {
    const hiddenOverrides = {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { isActive: false },
    };

    const updatedWidget = updateWidget({
      existingWidget: buildFormFieldWidget({
        overrides: hiddenOverrides,
        universalOverrides: hiddenOverrides,
      }),
      isActive: true,
    });

    expect(updatedWidget.isActive).toBe(true);
    expect(updatedWidget.overrides).toBeNull();
    expect(updatedWidget.universalOverrides).toBeNull();
  });

  it('keeps unrelated override entries when hiding a widget', () => {
    const titleOverrides = {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { title: 'Custom' },
    };

    const updatedWidget = updateWidget({
      existingWidget: buildFormFieldWidget({
        overrides: titleOverrides,
        universalOverrides: titleOverrides,
      }),
      isActive: false,
    });

    expect(updatedWidget.overrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        title: 'Custom',
        isActive: false,
      },
    });
  });

  it('hides widgets of any type the same way', () => {
    const updatedWidget = updateWidget({
      existingWidget: buildFormFieldWidget({ type: WidgetType.GRAPH }),
      isActive: false,
    });

    expect(updatedWidget.isActive).toBe(true);
    expect(updatedWidget.overrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { isActive: false },
    });
  });

  it('writes the column of a widget the workspace owns outright', () => {
    const updatedWidget = updateWidget({
      existingWidget: buildFormFieldWidget({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: false,
      }),
      isActive: false,
    });

    expect(updatedWidget.isActive).toBe(false);
    expect(updatedWidget.overrides).toBeNull();
  });
});
