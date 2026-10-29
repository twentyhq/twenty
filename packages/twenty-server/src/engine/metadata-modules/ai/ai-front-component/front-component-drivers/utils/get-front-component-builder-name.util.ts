import { readFile } from 'fs/promises';
import { join } from 'path';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import {
  BUILDER_LAMBDA_MEMORY_MB,
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
  LAMBDA_EPHEMERAL_STORAGE_MB,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';
import { FRONT_COMPONENT_BUILDER_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-directory.constant';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';

export const getFrontComponentBuilderName = async ({
  workspaceId,
  namespace,
  action,
}: {
  workspaceId: string;
  namespace?: string;
  action: FrontComponentBuilderRequest['action'];
}) => {
  const buildsDependencies = action === 'buildDependencies';
  const handlerSource = await readFile(
    join(FRONT_COMPONENT_BUILDER_DIRECTORY, 'index.js'),
    'utf8',
  );
  const yarnEngineFiles = buildsDependencies
    ? await Promise.all(
        ['.yarnrc.yml', '.yarn/releases/yarn-4.9.2.cjs'].map((file) =>
          readFile(join(YARN_ENGINE_DIRNAME, file), 'utf8'),
        ),
      )
    : [];

  return computeHashedLambdaResourceName({
    resourceNamePrefix: buildsDependencies
      ? 'twenty-front-component-dependencies'
      : 'twenty-front-component-builder',
    namespace,
    contents: [
      workspaceId,
      handlerSource,
      ...yarnEngineFiles,
      String(
        buildsDependencies
          ? YARN_INSTALL_LAMBDA_MEMORY_MB
          : BUILDER_LAMBDA_MEMORY_MB,
      ),
      String(
        buildsDependencies
          ? YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS
          : BUILDER_LAMBDA_TIMEOUT_SECONDS,
      ),
      String(LAMBDA_EPHEMERAL_STORAGE_MB),
    ],
  });
};
