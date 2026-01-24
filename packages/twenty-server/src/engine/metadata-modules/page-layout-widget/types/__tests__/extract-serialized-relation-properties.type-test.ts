import { type Equal, type Expect } from 'twenty-shared/testing';
import { type ExtractSerializedRelationProperties } from 'twenty-shared/types';

import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type GaugeChartConfiguration =
  PageLayoutWidgetEntity<WidgetConfigurationType.GAUGE_CHART>['configuration'];

type AllConfigurations =
  PageLayoutWidgetEntity<WidgetConfigurationType>['configuration'];

type GaugeChartSerializedRelationProperties =
  ExtractSerializedRelationProperties<GaugeChartConfiguration>;

type AllConfigurationsSerializedRelationProperties =
  ExtractSerializedRelationProperties<AllConfigurations>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<GaugeChartSerializedRelationProperties, 'aggregateFieldMetadataId'>
  >,
  Expect<
    Equal<
      AllConfigurationsSerializedRelationProperties,
      | 'aggregateFieldMetadataId'
      | 'groupByFieldMetadataId'
      | 'primaryAxisGroupByFieldMetadataId'
      | 'secondaryAxisGroupByFieldMetadataId'
    >
  >,
];
