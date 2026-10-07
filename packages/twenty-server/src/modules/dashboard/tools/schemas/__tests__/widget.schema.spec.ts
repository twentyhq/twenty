import { AggregateOperations } from 'twenty-shared/types';

import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  dashboardFilterBindingsSchema,
  widgetConfigurationSchema,
} from 'src/modules/dashboard/tools/schemas/widget.schema';

const CREATED_AT_FIELD_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const AMOUNT_FIELD_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const OWNER_FIELD_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';
const OWNER_NAME_FIELD_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';

describe('dashboardFilterBindingsSchema', () => {
  it('accepts bindings keyed by slot id, including explicit null entries', () => {
    const result = dashboardFilterBindingsSchema.safeParse({
      date: { fieldMetadataId: CREATED_AT_FIELD_ID },
      amount: {
        fieldMetadataId: AMOUNT_FIELD_ID,
        subFieldName: 'amountMicros',
      },
      owner: {
        fieldMetadataId: OWNER_FIELD_ID,
        relationTargetFieldMetadataId: OWNER_NAME_FIELD_ID,
      },
      stage: null,
    });

    expect(result.success).toBe(true);
  });

  it('accepts bindings that name their fields instead of giving UUIDs', () => {
    const result = dashboardFilterBindingsSchema.safeParse({
      date: { fieldName: 'createdAt' },
      owner: { fieldName: 'owner', relationTargetFieldName: 'name' },
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ['a fieldMetadataId that is not a UUID', { fieldMetadataId: 'createdAt' }],
    ['a binding with neither fieldMetadataId nor fieldName', {}],
    ['a blank fieldName', { fieldName: '' }],
    [
      'an unknown composite sub field name',
      { fieldMetadataId: AMOUNT_FIELD_ID, subFieldName: 'amount' },
    ],
    [
      'a relation target that is not a UUID',
      {
        fieldMetadataId: OWNER_FIELD_ID,
        relationTargetFieldMetadataId: 'name',
      },
    ],
  ])('rejects %s', (_label, binding) => {
    expect(
      dashboardFilterBindingsSchema.safeParse({ date: binding }).success,
    ).toBe(false);
  });

  it('rejects a blank slot id', () => {
    expect(
      dashboardFilterBindingsSchema.safeParse({
        '': { fieldMetadataId: CREATED_AT_FIELD_ID },
      }).success,
    ).toBe(false);
  });
});

describe('widgetConfigurationSchema', () => {
  it.each([
    WidgetConfigurationType.AGGREGATE_CHART,
    WidgetConfigurationType.BAR_CHART,
    WidgetConfigurationType.LINE_CHART,
    WidgetConfigurationType.PIE_CHART,
  ])('accepts optional dashboardFilterBindings on %s', (configurationType) => {
    const result = widgetConfigurationSchema.safeParse({
      configurationType,
      aggregateFieldMetadataId: AMOUNT_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      ...(configurationType === WidgetConfigurationType.BAR_CHART
        ? { layout: BarChartLayout.VERTICAL }
        : {}),
      dashboardFilterBindings: {
        date: { fieldMetadataId: CREATED_AT_FIELD_ID },
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      dashboardFilterBindings: {
        date: { fieldMetadataId: CREATED_AT_FIELD_ID },
      },
    });
  });
});
