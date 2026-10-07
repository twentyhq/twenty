import {
  AggregateOperations,
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  COMPANY_ACCOUNT_OWNER_FIELD_ID,
  COMPANY_CREATED_AT_FIELD_ID,
  COMPANY_EXTERNAL_ID_FIELD_ID,
  COMPANY_ID_FIELD_ID,
  COMPANY_NAME_FIELD_ID,
  COMPANY_NOTES_FIELD_ID,
  COMPANY_POSITION_FIELD_ID,
  dashboardFilterBindingFlatFieldMetadataMaps,
  UNKNOWN_FIELD_ID,
  WORKSPACE_MEMBER_NAME_FIELD_ID,
} from 'src/engine/metadata-modules/page-layout-widget/utils/__tests__/dashboard-filter-binding-flat-maps.mock';
import { validateDashboardFilterBindingsAgainstSlotsOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-dashboard-filter-bindings-against-slots.util';

const WIDGET_TITLE = 'Companies per month';

const SLOTS: DashboardFilterSlot[] = [
  { id: 'date', label: 'Date', filterType: 'DATE_TIME' },
  { id: 'owner', label: 'Owner', filterType: 'RELATION' },
  { id: 'owner-name', label: 'Owner name', filterType: 'FULL_NAME' },
];

const validate = (
  dashboardFilterBindings: Record<string, DashboardFilterBinding | null>,
  dashboardFilters: DashboardFilterSlot[] | null = SLOTS,
) =>
  validateDashboardFilterBindingsAgainstSlotsOrThrow({
    widgetConfiguration: {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: COMPANY_POSITION_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      dashboardFilterBindings,
    },
    widgetTitle: WIDGET_TITLE,
    dashboardFilters,
    flatFieldMetadataMaps: dashboardFilterBindingFlatFieldMetadataMaps,
  });

describe('validateDashboardFilterBindingsAgainstSlotsOrThrow', () => {
  it('should accept bindings whose effective filter type matches the slot', () => {
    expect(() =>
      validate({
        date: { fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID },
        owner: { fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID },
        'owner-name': {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: WORKSPACE_MEMBER_NAME_FIELD_ID,
        },
      }),
    ).not.toThrow();
  });

  it('should accept a null binding for a defined slot', () => {
    expect(() => validate({ date: null })).not.toThrow();
  });

  it('should skip the checks while the layout uses the built-in slots', () => {
    expect(() =>
      validate({ anything: { fieldMetadataId: COMPANY_NAME_FIELD_ID } }, null),
    ).not.toThrow();
  });

  it('should skip bindings whose field is missing, since field references report them', () => {
    expect(() =>
      validate({ date: { fieldMetadataId: UNKNOWN_FIELD_ID } }),
    ).not.toThrow();
  });

  it('should ignore non-chart configurations', () => {
    expect(() =>
      validateDashboardFilterBindingsAgainstSlotsOrThrow({
        widgetConfiguration: {
          configurationType: WidgetConfigurationType.IFRAME,
          url: 'https://example.com',
        },
        widgetTitle: WIDGET_TITLE,
        dashboardFilters: SLOTS,
        flatFieldMetadataMaps: dashboardFilterBindingFlatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should reject a binding for a slot that is not defined on the layout', () => {
    expect(() =>
      validate({ stage: { fieldMetadataId: COMPANY_NAME_FIELD_ID } }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "stage" is not defined on this layout.`,
    );
  });

  it('should reject a null binding for a slot that is not defined on the layout', () => {
    expect(() => validate({ stage: null })).toThrow(
      'Dashboard filter "stage" is not defined on this layout.',
    );
  });

  it('should reject a binding whose field type differs from the slot type', () => {
    expect(() =>
      validate({ date: { fieldMetadataId: COMPANY_NAME_FIELD_ID } }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "date" expects a DATE_TIME field but is bound to "Name" (TEXT).`,
    );
  });

  it('should compare the relation target type when a binding traverses a relation', () => {
    expect(() =>
      validate({
        owner: {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: WORKSPACE_MEMBER_NAME_FIELD_ID,
        },
      }),
    ).toThrow(
      'Dashboard filter "owner" expects a RELATION field but is bound to "Account owner" (FULL_NAME).',
    );
  });
  it('should accept the id field of the widget object for a RELATION slot', () => {
    expect(() =>
      validate({ owner: { fieldMetadataId: COMPANY_ID_FIELD_ID } }),
    ).not.toThrow();
  });

  it('should reject another UUID column of the widget object for a RELATION slot', () => {
    expect(() =>
      validate({ owner: { fieldMetadataId: COMPANY_EXTERNAL_ID_FIELD_ID } }),
    ).toThrow(
      'Dashboard filter "owner" expects a RELATION field but is bound to "External id" (UUID).',
    );
  });

  it('should reject a UUID binding on a slot that is not a RELATION', () => {
    expect(() =>
      validate({ date: { fieldMetadataId: COMPANY_ID_FIELD_ID } }),
    ).toThrow(
      'Dashboard filter "date" expects a DATE_TIME field but is bound to "Id" (UUID).',
    );
  });

  it('should reject a binding to a field whose type cannot be filtered before comparing types', () => {
    expect(() =>
      validate({ date: { fieldMetadataId: COMPANY_NOTES_FIELD_ID } }),
    ).toThrow(
      'Dashboard filter "date" is bound to a field of type RICH_TEXT, which cannot be filtered.',
    );
  });
});
