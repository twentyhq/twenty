import { type z } from 'zod';

import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';

export type FrontComponentQuery = z.infer<typeof frontComponentQuerySchema>;
