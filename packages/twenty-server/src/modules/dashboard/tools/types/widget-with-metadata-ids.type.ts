import { type z } from 'zod';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type gridPositionSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

export type WidgetWithMetadataIds = {
  title: string;
  type: WidgetType;
  gridPosition: z.infer<typeof gridPositionSchema>;
  objectMetadataId?: string;
  configuration?: AllPageLayoutWidgetConfiguration;
};
