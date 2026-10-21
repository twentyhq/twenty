import { type z } from 'zod';

import { frontComponentDiagnosticSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-diagnostic.schema';

export type FrontComponentDiagnostic = z.infer<
  typeof frontComponentDiagnosticSchema
>;
