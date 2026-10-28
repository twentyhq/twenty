import { type Lambda } from '@aws-sdk/client-lambda';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { DEPENDENCY_LAYER_FIXTURE } from 'test/integration/logic-function-lambda/constants/dependency-layer-fixture.constant';
import { getWorkspaceCustomFlatApplication } from 'test/integration/logic-function-lambda/utils/get-workspace-custom-flat-application.util';

import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const publishDependencyLayerFixture = async ({
  lambdaClient,
  resourceNamespace,
  workspaceId,
}: {
  lambdaClient: Lambda;
  resourceNamespace: string;
  workspaceId: string;
}): Promise<void> => {
  const flatApplication = await getWorkspaceCustomFlatApplication(workspaceId);
  const buildDirectory = await fs.mkdtemp(join(tmpdir(), 'deps-layer-'));
  const packageDirectory = join(
    buildDirectory,
    'layer/nodejs/node_modules',
    DEPENDENCY_LAYER_FIXTURE.packageName,
  );
  const zipPath = join(buildDirectory, 'layer.zip');

  try {
    await fs.mkdir(packageDirectory, { recursive: true });
    await fs.writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: DEPENDENCY_LAYER_FIXTURE.packageName,
        type: 'module',
        main: 'index.js',
      }),
    );
    await fs.writeFile(
      join(packageDirectory, 'index.js'),
      `export const greeting = ${JSON.stringify(DEPENDENCY_LAYER_FIXTURE.greeting)};`,
    );
    await createZipFile(join(buildDirectory, 'layer'), zipPath);

    await lambdaClient.publishLayerVersion({
      LayerName: getLambdaDepsLayerName({
        flatApplication,
        namespace: resourceNamespace,
      }),
      Content: { ZipFile: await fs.readFile(zipPath) },
      CompatibleRuntimes: [LogicFunctionRuntime.NODE22],
    });
  } finally {
    await fs.rm(buildDirectory, { recursive: true, force: true });
  }
};
