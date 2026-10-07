import {
  AggregateOperations,
  type DashboardFilterBinding,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  COMPANY_ACCOUNT_OWNER_FIELD_ID,
  COMPANY_CREATED_AT_FIELD_ID,
  COMPANY_NOTES_FIELD_ID,
  COMPANY_OBJECT_ID,
  COMPANY_PEOPLE_FIELD_ID,
  COMPANY_POSITION_FIELD_ID,
  dashboardFilterBindingFlatFieldMetadataMaps,
  dashboardFilterBindingFlatObjectMetadataMaps,
  PERSON_CREATED_AT_FIELD_ID,
  UNKNOWN_FIELD_ID,
  WORKSPACE_MEMBER_NAME_FIELD_ID,
  WORKSPACE_MEMBER_NOTES_FIELD_ID,
} from 'src/engine/metadata-modules/page-layout-widget/utils/__tests__/dashboard-filter-binding-flat-maps.mock';
import { validateChartConfigurationFieldReferencesOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util';

const WIDGET_TITLE = 'Companies per month';

const validateBindings = (
  dashboardFilterBindings: Record<string, DashboardFilterBinding | null>,
) =>
  validateChartConfigurationFieldReferencesOrThrow({
    widgetConfiguration: {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: COMPANY_POSITION_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      dashboardFilterBindings,
    },
    widgetObjectMetadataId: COMPANY_OBJECT_ID,
    widgetTitle: WIDGET_TITLE,
    flatFieldMetadataMaps: dashboardFilterBindingFlatFieldMetadataMaps,
    flatObjectMetadataMaps: dashboardFilterBindingFlatObjectMetadataMaps,
  });

describe('validateChartConfigurationFieldReferencesOrThrow - dashboard filter bindings', () => {
  it('should accept a binding to a filterable field of the widget object and a null binding', () => {
    expect(() =>
      validateBindings({
        date: { fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID },
        owner: null,
      }),
    ).not.toThrow();
  });

  it('should accept a many-to-one traversal to a filterable field of the target object', () => {
    expect(() =>
      validateBindings({
        owner: {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: WORKSPACE_MEMBER_NAME_FIELD_ID,
        },
      }),
    ).not.toThrow();
  });

  it('should reject a binding to a deleted field with the chart title', () => {
    expect(() =>
      validateBindings({ date: { fieldMetadataId: UNKNOWN_FIELD_ID } }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "date" is bound to field id "${UNKNOWN_FIELD_ID}", but it was deleted.`,
    );
  });

  it('should reject a binding to a field of another object', () => {
    expect(() =>
      validateBindings({
        date: { fieldMetadataId: PERSON_CREATED_AT_FIELD_ID },
      }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "date" must be bound to a field of objectMetadataId "${COMPANY_OBJECT_ID}".`,
    );
  });

  it('should reject a binding to a field whose type cannot be filtered', () => {
    expect(() =>
      validateBindings({ notes: { fieldMetadataId: COMPANY_NOTES_FIELD_ID } }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "notes" is bound to a field of type RICH_TEXT, which cannot be filtered.`,
    );
  });

  it('should reject a relation target on a field that is not a many-to-one relation', () => {
    expect(() =>
      validateBindings({
        people: {
          fieldMetadataId: COMPANY_PEOPLE_FIELD_ID,
          relationTargetFieldMetadataId: PERSON_CREATED_AT_FIELD_ID,
        },
      }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "people" sets a relation target field on "People", which is not a many-to-one relation.`,
    );
  });

  it('should reject a relation target on a non-relation field', () => {
    expect(() =>
      validateBindings({
        date: {
          fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID,
          relationTargetFieldMetadataId: WORKSPACE_MEMBER_NAME_FIELD_ID,
        },
      }),
    ).toThrow('which is not a many-to-one relation.');
  });

  it('should reject a deleted relation target field', () => {
    expect(() =>
      validateBindings({
        owner: {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: UNKNOWN_FIELD_ID,
        },
      }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "owner" targets field id "${UNKNOWN_FIELD_ID}" through "Account owner", but it was deleted.`,
    );
  });

  it('should reject a relation target field that belongs to another object than the relation target', () => {
    expect(() =>
      validateBindings({
        owner: {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: PERSON_CREATED_AT_FIELD_ID,
        },
      }),
    ).toThrow(
      `Chart "${WIDGET_TITLE}": Dashboard filter "owner" targets field "Created at", which does not belong to the object "Account owner" points to.`,
    );
  });

  it('should reject a relation target field whose type cannot be filtered', () => {
    expect(() =>
      validateBindings({
        owner: {
          fieldMetadataId: COMPANY_ACCOUNT_OWNER_FIELD_ID,
          relationTargetFieldMetadataId: WORKSPACE_MEMBER_NOTES_FIELD_ID,
        },
      }),
    ).toThrow(
      'is bound to a field of type RICH_TEXT, which cannot be filtered.',
    );
  });
});
