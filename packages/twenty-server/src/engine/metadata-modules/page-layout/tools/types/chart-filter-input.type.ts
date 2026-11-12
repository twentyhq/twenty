import { type z } from 'zod';

import { type chartFilterSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget.schema';

export type ChartFilterInput = z.infer<typeof chartFilterSchema>;
