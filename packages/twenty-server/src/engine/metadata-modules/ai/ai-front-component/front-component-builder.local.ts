import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { executeFrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/utils/execute-front-component-builder-request.util';

process.once(
  'message',
  (request: {
    input: FrontComponentBuilderRequest;
    yarnEngineDirectory: string;
  }) => {
    void executeFrontComponentBuilderRequest(request)
      .then((result) => {
        process.send?.(result, () => process.exit(0));
      })
      .catch((error: unknown) => {
        process.stderr.write(
          error instanceof Error ? error.message : String(error),
          () => process.exit(1),
        );
      });
  },
);
