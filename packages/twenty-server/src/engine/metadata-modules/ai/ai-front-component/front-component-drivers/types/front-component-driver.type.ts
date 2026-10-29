import { type z } from 'zod';
import { type frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { type frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';

export type FrontComponentDriver = {
  getDependenciesBuildCacheKey(workspaceId: string): Promise<string>;
  transpile(
    request: Omit<
      Extract<FrontComponentBuilderRequest, { action: 'transpile' }>,
      'action'
    > & { workspaceId: string },
  ): Promise<z.infer<typeof frontComponentBuildResultSchema>>;
  buildDependencies(
    request: Omit<
      Extract<FrontComponentBuilderRequest, { action: 'buildDependencies' }>,
      'action'
    > & { workspaceId: string },
  ): Promise<z.infer<typeof frontComponentDependenciesBuildResultSchema>>;
};
