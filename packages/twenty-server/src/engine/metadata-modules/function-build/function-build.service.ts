import { Injectable } from '@nestjs/common';

import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function-executor/drivers/utils/lambda-build-directory-manager';
import { LOGIC_FUNCTION_CODE_SOURCE_PREFIX } from 'src/engine/metadata-modules/logic-function/constants/logic-function-code-source-prefix.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type FunctionBuildParams = {
  flatLogicFunction: FlatLogicFunction;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class FunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async isBuilt({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: FunctionBuildParams): Promise<boolean> {
    return await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatLogicFunction.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: `${flatLogicFunction.id}/${flatLogicFunction.builtHandlerPath}`,
    });
  }

  async buildAndUpload({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: FunctionBuildParams): Promise<void> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.fileStorageService.downloadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: `${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${flatLogicFunction.id}`,
        localPath: sourceTemporaryDir,
      });

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        builtHandlerPath: flatLogicFunction.builtHandlerPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.writeFile_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: `${flatLogicFunction.id}/${flatLogicFunction.builtHandlerPath}`,
        sourceFile: builtFile,
        mimeType: 'application/javascript',
      });
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }

  private async buildInMemory({
    sourceTemporaryDir,
    sourceHandlerPath,
    builtHandlerPath,
  }: {
    sourceTemporaryDir: string;
    sourceHandlerPath: string;
    builtHandlerPath: string;
  }): Promise<string> {
    const entryFilePath = join(sourceTemporaryDir, sourceHandlerPath);
    const builtBundleFilePath = join(sourceTemporaryDir, builtHandlerPath);

    await build({
      entryPoints: [entryFilePath],
      outfile: builtBundleFilePath,
      platform: 'node',
      format: 'esm',
      target: 'es2017',
      bundle: true,
      sourcemap: true,
      packages: 'external',
    });

    return builtBundleFilePath;
  }
}
