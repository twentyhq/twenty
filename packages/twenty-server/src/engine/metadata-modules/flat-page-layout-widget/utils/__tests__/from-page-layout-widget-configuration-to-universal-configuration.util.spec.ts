import {
  AggregateOperations,
  type ChartFilter,
  type UniversalChartFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const RELATION_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000001';
const TARGET_TEXT_FIELD_ID = '11111111-2222-4222-8222-000000000002';
const TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const AGGREGATE_FIELD_ID = '11111111-3333-4333-8333-000000000003';
const AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';
const DELETED_FIELD_ID = '11111111-9999-4999-8999-000000000009';

const fieldMetadataUniversalIdentifierById = {
  [RELATION_FIELD_ID]: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  [TARGET_TEXT_FIELD_ID]: TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  [AGGREGATE_FIELD_ID]: AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER,
};

const getUniversalRecordFilters = (
  recordFilters: NonNullable<ChartFilter['recordFilters']>,
): UniversalChartFilter['recordFilters'] => {
  const universalConfiguration =
    fromPageLayoutWidgetConfigurationToUniversalConfiguration({
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
        aggregateOperation: AggregateOperations.SUM,
        filter: { recordFilters },
      },
      fieldMetadataUniversalIdentifierById,
    });

  if (
    universalConfiguration.configurationType !==
    WidgetConfigurationType.AGGREGATE_CHART
  ) {
    throw new Error('Expected an aggregate chart universal configuration');
  }

  return universalConfiguration.filter?.recordFilters;
};

describe('fromPageLayoutWidgetConfigurationToUniversalConfiguration', () => {
  it('should convert the relation target field id of a relation-traversal chart filter to its universal identifier', () => {
    const recordFilters = getUniversalRecordFilters([
      {
        fieldMetadataId: RELATION_FIELD_ID,
        relationTargetFieldMetadataId: TARGET_TEXT_FIELD_ID,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);

    expect(recordFilters).toEqual([
      {
        fieldMetadataUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);
  });

  it('should resolve a deleted relation target field to null instead of throwing', () => {
    const recordFilters = getUniversalRecordFilters([
      {
        fieldMetadataId: RELATION_FIELD_ID,
        relationTargetFieldMetadataId: DELETED_FIELD_ID,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);

    expect(
      recordFilters?.[0].relationTargetFieldMetadataUniversalIdentifier,
    ).toBeNull();
  });
});
