import { cp, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import {
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';
import { FRONT_COMPONENT_BUILDER_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-directory.constant';
import { type FrontComponentDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/types/front-component-driver.type';
import { getFrontComponentBuilderName } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/utils/get-front-component-builder-name.util';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

export class LocalDriver implements FrontComponentDriver {
  private readonly childProcessRunner = new LocalChildProcessRunnerService();

  async getDependenciesBuildCacheKey(workspaceId: string) {
    const name = await getFrontComponentBuilderName({
      workspaceId,
      namespace: 'local',
      action: 'buildDependencies',
    });
    return `local:${name}`;
  }

  async transpile(request: Parameters<FrontComponentDriver['transpile']>[0]) {
    return frontComponentBuildResultSchema.parse(
      await this.invoke({ ...request, action: 'transpile' }),
    );
  }

  async buildDependencies(
    request: Parameters<FrontComponentDriver['buildDependencies']>[0],
  ) {
    return frontComponentDependenciesBuildResultSchema.parse(
      await this.invoke({ ...request, action: 'buildDependencies' }),
    );
  }

  private async invoke(input: FrontComponentBuilderRequest) {
    const directory = await mkdtemp(join(tmpdir(), 'front-component-builder-'));
    try {
      if (input.action === 'buildDependencies') {
        await cp(YARN_ENGINE_DIRNAME, join(directory, 'yarn-engine'), {
          recursive: true,
        });
      }
      const runnerPath = await this.childProcessRunner.writeBootstrapRunner({
        dir: directory,
        builtFileAbsPath: join(FRONT_COMPONENT_BUILDER_DIRECTORY, 'index.js'),
        handlerName: 'handler',
      });
      const { NODE_OPTIONS: _nodeOptions, ...environment } = process.env;
      const result = await this.childProcessRunner.runChild({
        runnerPath,
        executionDirectory: directory,
        env: {
          ...environment,
          TMPDIR: directory,
          TMP: directory,
          TEMP: directory,
        },
        payload: input,
        timeoutMs:
          (input.action === 'buildDependencies'
            ? YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS
            : BUILDER_LAMBDA_TIMEOUT_SECONDS) * 1000,
        maxOutputLength: 8192,
      });
      if (!result.ok) {
        throw new FrontComponentException(
          `Local frontend component builder failed: ${result.error ?? result.stderr}`,
          FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
        );
      }
      return result.result;
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
