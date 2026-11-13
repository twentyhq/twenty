import {
  decodeFrontComponentTypeReferences,
  getFrontComponentTypeDiagnostics,
} from 'twenty-shared/front-component-build';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import FRONT_COMPONENT_CONTEXT_MODULE from 'src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-context-module.json';
import { validateFrontComponentSourceOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-source-or-throw.util';

export const validateFrontComponentTypesOrThrow = ({
  source,
  typeReferences,
}: {
  source: string;
  typeReferences: string;
}) => {
  validateFrontComponentSourceOrThrow(source);
  const diagnostics = getFrontComponentTypeDiagnostics({
    source,
    files: {
      ...decodeFrontComponentTypeReferences(
        Buffer.from(typeReferences, 'base64'),
      ),
      '/node_modules/twenty-sdk/package.json': JSON.stringify({
        exports: { './front-component': './front-component.d.ts' },
      }),
      '/node_modules/twenty-sdk/front-component.d.ts':
        FRONT_COMPONENT_CONTEXT_MODULE.types,
    },
  });

  if (diagnostics.length > 0) {
    throw new FrontComponentBuildException({
      code: 'BUILD_FAILED',
      message: diagnostics.join('\n'),
    });
  }
};
