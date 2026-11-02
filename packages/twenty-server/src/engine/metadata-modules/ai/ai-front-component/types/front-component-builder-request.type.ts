import { type z } from 'zod';
import { type frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';

export type FrontComponentBuilderRequest =
  | { action: 'buildDependencies'; packageJson: string; yarnLock: string }
  | {
      action: 'transpile';
      input: FrontComponentBuildInput;
      manifest: z.infer<typeof frontComponentSharedDependenciesManifestSchema>;
    };
