import { createUnionType } from '@nestjs/graphql';

import { ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/all-widget-configuration-type-validator-by-widget-configuration-type.constant';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

export const WidgetConfiguration = createUnionType({
  name: 'WidgetConfiguration',
  types: () =>
    Object.values(
      ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE,
    ),
  resolveType({ configurationType }: AllPageLayoutWidgetConfiguration) {
    return ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE[
      configurationType
    ];
  },
});
