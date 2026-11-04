import { type z } from 'zod';

import { type widgetConfigurationSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';

export type WidgetConfigurationInput = NonNullable<
  z.infer<typeof widgetConfigurationSchema>
>;
