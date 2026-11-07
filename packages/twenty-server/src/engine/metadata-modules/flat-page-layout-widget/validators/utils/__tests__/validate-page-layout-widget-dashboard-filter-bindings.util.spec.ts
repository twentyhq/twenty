import {
  FieldMetadataType,
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  type UniversalDashboardFilterBinding,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validatePageLayoutWidgetDashboardFilterBindings } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000002';

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

const PERIOD_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

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
}: {
  universalIdentifier: string;
  type: FieldMetadataType;
  objectMetadataUniversalIdentifier?: string;
  isActive?: boolean;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: 'object-metadata-id',
    objectMetadataUniversalIdentifier,
    type,
    name: 'closeDate',
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
    },
  };

const validateBindings = ({
  dashboardFilterBindings,
  pageLayoutType = PageLayoutType.DASHBOARD,
  filters = [PERIOD_FILTER, CLOSE_DATE_FILTER],
  isActive = true,
  universalOverrides = null,
}: {
  dashboardFilterBindings: UniversalDashboardFilterBinding[] | null;
  pageLayoutType?: PageLayoutType;
  filters?: PageLayoutFilter[] | null;
  isActive?: boolean;
  universalOverrides?: UniversalFlatPageLayoutWidget['universalOverrides'];
}) =>
  validatePageLayoutWidgetDashboardFilterBindings({
    widget: {
      title: 'Deals per month',
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      isActive,
      universalOverrides,
      universalConfiguration: {
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        dashboardFilterBindings,
      },
    },
    pageLayout: { type: pageLayoutType, filters },
    flatFieldMetadataMaps,
  });

describe('validatePageLayoutWidgetDashboardFilterBindings', () => {
  it('should accept bindings to DATE, DATE_TIME and deactivated fields', () => {
    expect(
      validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER.id,
            fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
          },
          {
            pageLayoutFilterId: CLOSE_DATE_FILTER.id,
            fieldMetadataUniversalIdentifier:
              DEACTIVATED_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    ).toEqual([]);

    expect(
      validateBindings({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER.id,
            fieldMetadataUniversalIdentifier:
              DATE_TIME_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    ).toEqual([]);
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

  it('should reject a binding to a filter missing from the dashboard', () => {
    const errors = validateBindings({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: CLOSE_DATE_FILTER.id,
          fieldMetadataUniversalIdentifier: DATE_FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
      filters: [PERIOD_FILTER],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'which does not exist on its dashboard',
    );
  });

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
    ['a field it cannot resolve', null, 'does not exist'],
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
