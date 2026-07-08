import { type z } from 'zod';

import { type chartFilterSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

export type ChartFilterInput = z.infer<typeof chartFilterSchema>;
