import { z } from 'zod';
import { frontComponentBuildFailureSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-failure.schema';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';

export const frontComponentDependenciesBuildResultSchema = z.discriminatedUnion(
  'success',
  [
    frontComponentSharedDependenciesManifestSchema.extend({
      success: z.literal(true),
      builtCode: z.string(),
    }),
    frontComponentBuildFailureSchema,
  ],
);
