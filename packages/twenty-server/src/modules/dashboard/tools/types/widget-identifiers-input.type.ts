import { type z } from 'zod';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type gridPositionSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';

export type WidgetIdentifiersInput = {
  title: string;
  type: WidgetType;
  gridPosition: z.infer<typeof gridPositionSchema>;
  objectMetadataId?: string;
  objectName?: string;
  configuration?: WidgetConfigurationInput;
};
