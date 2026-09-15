import { type z } from 'zod';

import { type widgetConfigurationSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

export type WidgetConfigurationInput = NonNullable<
  z.infer<typeof widgetConfigurationSchema>
>;
