import { type z } from 'zod';

import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';

export type FrontComponentDraftInput = z.infer<
  typeof frontComponentDraftSchema
>;
