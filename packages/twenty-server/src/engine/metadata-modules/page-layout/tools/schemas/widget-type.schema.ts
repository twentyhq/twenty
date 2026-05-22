import { z } from 'zod';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

export const widgetTypeSchema = z.enum(
  Object.values(WidgetType) as [string, ...string[]],
);
