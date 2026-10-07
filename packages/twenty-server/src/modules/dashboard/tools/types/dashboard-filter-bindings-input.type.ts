import { type z } from 'zod';

import { type dashboardFilterBindingsSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

export type DashboardFilterBindingsInput = z.infer<
  typeof dashboardFilterBindingsSchema
>;
