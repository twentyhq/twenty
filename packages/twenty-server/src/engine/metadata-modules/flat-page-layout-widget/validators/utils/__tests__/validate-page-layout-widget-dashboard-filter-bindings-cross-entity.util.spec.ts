import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validatePageLayoutWidgetDashboardFilterBindingsCrossEntity } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings-cross-entity.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { buildUniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout-tab.test-util';
import { buildUniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout.test-util';

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000aa';
const TAB_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000bb';
const BOUND_WIDGET_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000cc';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000dd';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000ee';

const buildBoundWidget = ({
  isActive,
}: {
  isActive: boolean;
}): UniversalFlatPageLayoutWidget => ({
  universalIdentifier: BOUND_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: 'application',
  pageLayoutTabUniversalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
  title: 'Deals per month',
  type: WidgetType.RECORD_TABLE,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  position: null,
  conditionalDisplay: null,
  conditionalAvailabilityExpression: null,
  isActive,
  isSystemSideEffect: false,
  universalOverrides: null,
  universalConfiguration: {
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    dashboardFilterBindings: [
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      },
    ],
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});

const validateCrossEntity = ({
  updatedPageLayoutUniversalIdentifiers = [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
  updatedWidgetUniversalIdentifiers = [],
  failedWidgetUniversalIdentifiers = [],
  pageLayoutType = PageLayoutType.RECORD_PAGE,
  isBoundWidgetActive = true,
  tabOverrides = null,
}: {
  updatedPageLayoutUniversalIdentifiers?: string[];
  updatedWidgetUniversalIdentifiers?: string[];
  failedWidgetUniversalIdentifiers?: string[];
  pageLayoutType?: PageLayoutType;
  isBoundWidgetActive?: boolean;
  tabOverrides?: UniversalFlatPageLayoutTab['overrides'];
}) =>
  validatePageLayoutWidgetDashboardFilterBindingsCrossEntity({
    optimisticUniversalFlatMaps: {
      flatPageLayoutMaps: {
        byUniversalIdentifier: {
          [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]: {
            ...buildUniversalFlatPageLayout({
              universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
            }),
            type: pageLayoutType,
            filters: null,
            tabUniversalIdentifiers: [TAB_UNIVERSAL_IDENTIFIER],
            navigationMenuItemUniversalIdentifiers: [],
          },
        },
      },
      flatPageLayoutTabMaps: {
        byUniversalIdentifier: {
          [TAB_UNIVERSAL_IDENTIFIER]: {
            ...buildUniversalFlatPageLayoutTab({
              universalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
              pageLayoutUniversalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
            }),
            layoutMode: PageLayoutTabLayoutMode.GRID,
            overrides: tabOverrides,
            widgetUniversalIdentifiers: [BOUND_WIDGET_UNIVERSAL_IDENTIFIER],
          },
        },
      },
      flatPageLayoutWidgetMaps: {
        byUniversalIdentifier: {
          [BOUND_WIDGET_UNIVERSAL_IDENTIFIER]: buildBoundWidget({
            isActive: isBoundWidgetActive,
          }),
        },
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [FIELD_UNIVERSAL_IDENTIFIER]: getFlatFieldMetadataMock({
            universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
            objectMetadataId: 'object-metadata-id',
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            type: FieldMetadataType.DATE,
          }),
        },
      },
    },
    orchestratorActionsReport: {
      pageLayout: {
        create: [],
        update: updatedPageLayoutUniversalIdentifiers.map(
          (universalIdentifier) => ({
            type: 'update',
            metadataName: 'pageLayout',
            universalIdentifier,
            update: {},
          }),
        ),
        delete: [],
      },
      pageLayoutWidget: {
        create: [],
        update: updatedWidgetUniversalIdentifiers.map(
          (universalIdentifier) => ({
            type: 'update',
            metadataName: 'pageLayoutWidget',
            universalIdentifier,
            update: {},
          }),
        ),
        delete: [],
      },
    },
    orchestratorFailureReport: {
      pageLayoutWidget: failedWidgetUniversalIdentifiers.map(
        (universalIdentifier) => ({
          type: 'update',
          metadataName: 'pageLayoutWidget',
          flatEntityMinimalInformation: { universalIdentifier },
          errors: [],
        }),
      ),
    },
  });

describe('validatePageLayoutWidgetDashboardFilterBindingsCrossEntity', () => {
  it('should report an unchanged bound widget whose layout stops being a dashboard', () => {
    const { pageLayoutWidget } = validateCrossEntity({});

    expect(pageLayoutWidget).toHaveLength(1);
    expect(pageLayoutWidget[0].flatEntityMinimalInformation).toEqual({
      universalIdentifier: BOUND_WIDGET_UNIVERSAL_IDENTIFIER,
    });
    expect(pageLayoutWidget[0].errors[0].message).toContain(
      'is not on a dashboard',
    );
  });

  it('should accept the bound widget of an updated dashboard, stored filters or not', () => {
    expect(
      validateCrossEntity({ pageLayoutType: PageLayoutType.DASHBOARD })
        .pageLayoutWidget,
    ).toEqual([]);
  });

  it('should skip widgets the widget validator already checked in this migration', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      updatedWidgetUniversalIdentifiers: [BOUND_WIDGET_UNIVERSAL_IDENTIFIER],
    });

    expect(pageLayoutWidget).toEqual([]);
  });

  it('should not report again a widget that already failed its own validation', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      failedWidgetUniversalIdentifiers: [BOUND_WIDGET_UNIVERSAL_IDENTIFIER],
    });

    expect(pageLayoutWidget).toEqual([]);
  });

  it('should skip a deactivated bound widget', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      isBoundWidgetActive: false,
    });

    expect(pageLayoutWidget).toEqual([]);
  });

  it('should skip widgets on a tab the workspace removed', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      tabOverrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          isActive: false,
        },
      },
    });

    expect(pageLayoutWidget).toEqual([]);
  });

  it('should leave widgets alone when their dashboard was not updated', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      updatedPageLayoutUniversalIdentifiers: [],
    });

    expect(pageLayoutWidget).toEqual([]);
  });
});
