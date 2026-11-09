import {
  decodeFrontComponentTypeReferences,
  getFrontComponentTypeDiagnostics,
} from 'twenty-shared/front-component-build';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
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
    files: decodeFrontComponentTypeReferences(
      Buffer.from(typeReferences, 'base64'),
    ),
  });

  if (diagnostics.length > 0) {
    throw new FrontComponentBuildException({
      code: 'BUILD_FAILED',
      message: diagnostics.join('\n'),
    });
  }
};
