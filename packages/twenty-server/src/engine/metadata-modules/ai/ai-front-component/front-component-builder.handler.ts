import { resolve } from 'path';

import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { executeFrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/utils/execute-front-component-builder-request.util';

export const handler = (input: FrontComponentBuilderRequest) =>
  executeFrontComponentBuilderRequest({
    input,
    yarnEngineDirectory: resolve('yarn-engine'),
  });
