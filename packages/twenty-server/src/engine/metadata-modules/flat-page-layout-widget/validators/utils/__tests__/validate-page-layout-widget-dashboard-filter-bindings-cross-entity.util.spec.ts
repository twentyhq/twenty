import {
  FieldMetadataType,
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validatePageLayoutWidgetDashboardFilterBindingsCrossEntity } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings-cross-entity.util';

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000aa';
const TAB_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000bb';
const DANGLING_WIDGET_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000001';
const VALID_WIDGET_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000cc';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000dd';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const REMOVED_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02';

const buildWidget = ({
  universalIdentifier,
  pageLayoutFilterId,
}: {
  universalIdentifier: string;
  pageLayoutFilterId: string;
}) => ({
  universalIdentifier,
  title: 'Deals per month',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  universalConfiguration: {
    configurationType: 'BAR_CHART',
    dashboardFilterBindings: [
      {
        pageLayoutFilterId,
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      },
    ],
  },
});

const validateCrossEntity = ({
  updatedPageLayoutUniversalIdentifiers = [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
  updatedWidgetUniversalIdentifiers = [],
}: {
  updatedPageLayoutUniversalIdentifiers?: string[];
  updatedWidgetUniversalIdentifiers?: string[];
}) =>
  validatePageLayoutWidgetDashboardFilterBindingsCrossEntity({
    optimisticUniversalFlatMaps: {
      flatPageLayoutMaps: {
        byUniversalIdentifier: {
          [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]: {
            type: PageLayoutType.DASHBOARD,
            filters: [PERIOD_FILTER],
            tabUniversalIdentifiers: [TAB_UNIVERSAL_IDENTIFIER],
          },
        },
      },
      flatPageLayoutTabMaps: {
        byUniversalIdentifier: {
          [TAB_UNIVERSAL_IDENTIFIER]: {
            widgetUniversalIdentifiers: [
              DANGLING_WIDGET_UNIVERSAL_IDENTIFIER,
              VALID_WIDGET_UNIVERSAL_IDENTIFIER,
            ],
          },
        },
      },
      flatPageLayoutWidgetMaps: {
        byUniversalIdentifier: {
          [DANGLING_WIDGET_UNIVERSAL_IDENTIFIER]: buildWidget({
            universalIdentifier: DANGLING_WIDGET_UNIVERSAL_IDENTIFIER,
            pageLayoutFilterId: REMOVED_FILTER_ID,
          }),
          [VALID_WIDGET_UNIVERSAL_IDENTIFIER]: buildWidget({
            universalIdentifier: VALID_WIDGET_UNIVERSAL_IDENTIFIER,
            pageLayoutFilterId: PERIOD_FILTER.id,
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
        update: updatedPageLayoutUniversalIdentifiers.map(
          (universalIdentifier) => ({ universalIdentifier }),
        ),
      },
      pageLayoutWidget: {
        create: [],
        update: updatedWidgetUniversalIdentifiers.map(
          (universalIdentifier) => ({ universalIdentifier }),
        ),
      },
    },
  });

describe('validatePageLayoutWidgetDashboardFilterBindingsCrossEntity', () => {
  it('should report an unchanged widget still bound to a filter its updated dashboard removed', () => {
    const { pageLayoutWidget } = validateCrossEntity({});

    expect(pageLayoutWidget).toHaveLength(1);
    expect(pageLayoutWidget[0].flatEntityMinimalInformation).toEqual({
      universalIdentifier: DANGLING_WIDGET_UNIVERSAL_IDENTIFIER,
    });
    expect(pageLayoutWidget[0].errors[0].message).toContain(
      'which does not exist on its dashboard',
    );
  });

  it('should skip widgets the widget validator already checked in this migration', () => {
    const { pageLayoutWidget } = validateCrossEntity({
      updatedWidgetUniversalIdentifiers: [DANGLING_WIDGET_UNIVERSAL_IDENTIFIER],
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
