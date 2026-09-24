import { type z } from 'zod';

import { type WidgetType } from 'twenty-shared/types';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type widgetPositionSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

export type WidgetWithMetadataIds = {
  title: string;
  type: WidgetType;
  position: z.infer<typeof widgetPositionSchema>;
  objectMetadataId?: string;
  configuration?: AllPageLayoutWidgetConfiguration;
};
