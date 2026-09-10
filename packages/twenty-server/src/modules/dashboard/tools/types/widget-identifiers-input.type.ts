import { type z } from 'zod';

import { type WidgetType } from 'twenty-shared/types';
import { type widgetPositionSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';

export type WidgetIdentifiersInput = {
  title: string;
  type: WidgetType;
  position: z.infer<typeof widgetPositionSchema>;
  objectMetadataId?: string;
  objectName?: string;
  configuration?: WidgetConfigurationInput;
};
