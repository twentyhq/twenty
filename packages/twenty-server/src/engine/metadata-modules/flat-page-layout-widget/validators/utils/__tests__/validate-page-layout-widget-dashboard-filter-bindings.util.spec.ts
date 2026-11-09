import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type PageLayoutFilter,
  PageLayoutType,
  type UniversalDashboardFilterBinding,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validatePageLayoutWidgetDashboardFilterBindings } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { buildUniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout-tab.test-util';
import { buildUniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout.test-util';

const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000002';

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = '20202020-2222-4222-8222-000000000001';
const TAB_UNIVERSAL_IDENTIFIER = '20202020-2222-4222-8222-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-000000000002';
const DATE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-000000000001';
const DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000002';
const TEXT_FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-000000000003';
const DEACTIVATED_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000004';
const OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000005';
const DELETED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000006';

const PERIOD_FILTER = DASHBOARD_DATE_RANGE_FILTER;

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  ...PERIOD_FILTER,
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  label: 'Close date',
};

const buildFlatFieldMetadata = ({
  universalIdentifier,
  type,
  objectMetadataUniversalIdentifier = OBJECT_UNIVERSAL_IDENTIFIER,
  isActive = true,
  name = 'closeDate',
}: {
  universalIdentifier: string;
  type: FieldMetadataType;
  objectMetadataUniversalIdentifier?: string;
  isActive?: boolean;
  name?: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: 'object-metadata-id',
    objectMetadataUniversalIdentifier,
    type,
    name,
    isActive,
  });

const flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'> =
  {
    byUniversalIdentifier: {
      [DATE_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE,
      }),
      [DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE_TIME,
      }),
      [TEXT_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.TEXT,
      }),
      [DEACTIVATED_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: DEACTIVATED_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE_TIME,
        isActive: false,
      }),
      [OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE,
        objectMetadataUniversalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
      }),
      [DELETED_AT_FIELD_UNIVERSAL_IDENTIFIER]: buildFlatFieldMetadata({
        universalIdentifier: DELETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE_TIME,
        name: 'deletedAt',
      }),
    },
  };

const validateBindings = ({
  dashboardFilterBindings,
  pageLayoutType = PageLayoutType.DASHBOARD,
  filters = null,
  isActive = true,
  universalOverrides = null,
  pageLayoutTab,
}: {
  dashboardFilterBindings: UniversalDashboardFilterBinding[] | null;
  pageLayoutType?: PageLayoutType;
  filters?: PageLayoutFilter[] | null;
  isActive?: boolean;
  universalOverrides?: UniversalFlatPageLayoutWidget['universalOverrides'];
  pageLayoutTab?: Partial<
    Pick<UniversalFlatPageLayoutTab, 'isActive' | 'overrides'>
  >;
}) =>
  validatePageLayoutWidgetDashboardFilterBindings({
    widget: {
      title: 'Deals per month',
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      pageLayoutTabUniversalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      isActive,
      universalOverrides,
      universalConfiguration: {
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        dashboardFilterBindings,
      },
    },
    flatEntityMaps: {
      flatPageLayoutMaps: {
        byUniversalIdentifier: {
          [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]: {
            ...buildUniversalFlatPageLayout({
              universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
            }),
            type: pageLayoutType,
            filters,
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
            widgetUniversalIdentifiers: [],
            ...pageLayoutTab,
          },
        },
      },
      flatFieldMetadataMaps,
    },
  });

describe('validatePageLayoutWidgetDashboardFilterBindings', () => {
  it.each([
    ['DATE', DATE_FIELD_UNIVERSAL_IDENTIFIER],
    ['DATE_TIME', DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER],
    ['deactivated', DEACTIVATED_FIELD_UNIVERSAL_IDENTIFIER],
  ])(
    'should accept a binding to a %s field',
    (_title, fieldMetadataUniversalIdentifier) => {
      expect(
        validateBindings({
          dashboardFilterBindings: [
            {
              pageLayoutFilterId: PERIOD_FILTER.id,
              fieldMetadataUniversalIdentifier,
            },
          ],
        }),
      ).toEqual([]);
    },
  );

  it.each([
    ['nothing is stored', null],
    ['an empty list is stored', []],
    [
      'it is stored with a default value',
      [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
            ],
          },
        },
      ],
    ],
  ])(
    'should accept a binding to the built-in Date range filter when %s',
    (_title, filters) => {
      expect(
        validateBindings({
          dashboardFilterBindings: [
            {
              pageLayoutFilterId: PERIOD_FILTER.id,
              fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
            },
          ],
          filters,
        }),
      ).toEqual([]);
    },
  );

  it('should accept a binding that excludes the widget from a filter', () => {
    expect(
      validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER.id,
            fieldMetadataUniversalIdentifier: null,
          },
        ],
      }),
    ).toEqual([]);
  });

  it('should reject an exclusion from a filter other than the built-in Date range filter', () => {
    const errors = validateBindings({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: CLOSE_DATE_FILTER.id,
          fieldMetadataUniversalIdentifier: null,
        },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'which does not exist on its dashboard',
    );
  });

  it('should accept a configuration without bindings, even off a dashboard', () => {
    expect(
      validateBindings({
        dashboardFilterBindings: null,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toEqual([]);
    expect(
      validateBindings({
        dashboardFilterBindings: [],
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toEqual([]);
  });

  it('should report a binding with an unknown key as malformed', () => {
    const bindingWithUnknownKey = {
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
      subFieldName: 'year',
    };

    const errors = validateBindings({
      dashboardFilterBindings: [bindingWithUnknownKey],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('are malformed');
  });

  it.each([
    ['its own flag', { isActive: false }],
    [
      'an override',
      {
        universalOverrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            isActive: false,
          },
        },
      },
    ],
    ["its tab's flag", { pageLayoutTab: { isActive: false } }],
    [
      'an override on its tab',
      {
        pageLayoutTab: {
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              isActive: false,
            },
          },
        },
      },
    ],
  ])('should skip a widget deactivated through %s', (_title, deactivation) => {
    expect(
      validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER.id,
            fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
        filters: [],
        ...deactivation,
      }),
    ).toEqual([]);
  });

  it('should reject bindings on a widget that is not on a dashboard', () => {
    const errors = validateBindings({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
      pageLayoutType: PageLayoutType.RECORD_PAGE,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not on a dashboard');
  });

  it.each([
    ['nothing is stored', null],
    ['the dashboard stores the built-in filter', [PERIOD_FILTER]],
  ])(
    'should reject a binding to a filter other than the built-in Date range filter when %s',
    (_title, filters) => {
      const errors = validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: CLOSE_DATE_FILTER.id,
            fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
        filters,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain(
        'which does not exist on its dashboard',
      );
    },
  );

  it('should reject binding the same filter twice', () => {
    const errors = validateBindings({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        },
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataUniversalIdentifier:
            DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('more than once');
  });

  it.each([
    [
      'an unknown field',
      '20202020-9999-4999-8999-000000000009',
      'does not exist',
    ],
    [
      'a field of another object',
      OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      "does not belong to the widget's object",
    ],
    [
      'an incompatible field',
      TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      'is not compatible',
    ],
    [
      'the soft-delete field',
      DELETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      'is not compatible',
    ],
  ])(
    'should reject a binding to %s',
    (_title, fieldMetadataUniversalIdentifier, expectedMessage) => {
      const errors = validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER.id,
            fieldMetadataUniversalIdentifier,
          },
        ],
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain(expectedMessage);
    },
  );
});
