import {
  AggregateOperations,
  type UniversalChartFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';

const RELATION_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000001';
const TARGET_TEXT_FIELD_ID = '11111111-2222-4222-8222-000000000002';
const TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const AGGREGATE_FIELD_ID = '11111111-3333-4333-8333-000000000003';
const AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [RELATION_FIELD_UNIVERSAL_IDENTIFIER]: {
      id: RELATION_FIELD_ID,
      universalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
    },
    [TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER]: {
      id: TARGET_TEXT_FIELD_ID,
      universalIdentifier: TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
    },
    [AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER]: {
      id: AGGREGATE_FIELD_ID,
      universalIdentifier: AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER,
    },
  },
} as unknown as MetadataFlatEntityMaps<'fieldMetadata'>;

const emptyMaps = { byUniversalIdentifier: {} };

const getChartRecordFilters = (
  recordFilters: NonNullable<UniversalChartFilter['recordFilters']>,
) => {
  const configuration =
    fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
      universalConfiguration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataUniversalIdentifier:
          AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER,
        aggregateOperation: AggregateOperations.SUM,
        filter: { recordFilters },
      },
      flatFieldMetadataMaps,
      flatFrontComponentMaps:
        emptyMaps as MetadataFlatEntityMaps<'frontComponent'>,
      flatViewMaps: emptyMaps as MetadataFlatEntityMaps<'view'>,
      flatViewFieldGroupMaps:
        emptyMaps as MetadataFlatEntityMaps<'viewFieldGroup'>,
    });

  if (
    configuration.configurationType !== WidgetConfigurationType.AGGREGATE_CHART
  ) {
    throw new Error('Expected an aggregate chart configuration');
  }

  return configuration.filter?.recordFilters;
};

describe('fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration', () => {
  it('should resolve the relation target universal identifier of a relation-traversal chart filter back to a field metadata id', () => {
    const recordFilters = getChartRecordFilters([
      {
        fieldMetadataUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);

    expect(recordFilters).toEqual([
      {
        fieldMetadataId: RELATION_FIELD_ID,
        relationTargetFieldMetadataId: TARGET_TEXT_FIELD_ID,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);
  });
});
