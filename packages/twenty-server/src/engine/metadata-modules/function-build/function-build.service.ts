import { Injectable } from '@nestjs/common';

import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function-executor/drivers/utils/lambda-build-directory-manager';
import { LOGIC_FUNCTION_CODE_SOURCE_PREFIX } from 'src/engine/metadata-modules/logic-function/constants/logic-function-code-source-prefix.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

@Injectable()
export class FunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async isBuilt({
    flatLogicFunction,
  }: {
    flatLogicFunction: FlatLogicFunction;
  }): Promise<boolean> {
    const folderPath = `workspace-${flatLogicFunction.workspaceId}/${FileFolder.BuiltLogicFunction}/${flatLogicFunction.id}`;

    return await this.fileStorageService.checkFileExists({
      filePath: `${folderPath}/${flatLogicFunction.builtHandlerPath}`,
    });
  }

  async buildAndUpload({
    flatLogicFunction,
  }: {
    flatLogicFunction: FlatLogicFunction;
  }): Promise<void> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      const sourceFolderPath = `workspace-${flatLogicFunction.workspaceId}/${FileFolder.Source}/${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${flatLogicFunction.id}`;

      await this.fileStorageService.copy({
        from: { folderPath: sourceFolderPath },
        to: { folderPath: sourceTemporaryDir },
      });

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        builtHandlerPath: flatLogicFunction.builtHandlerPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      const builtFolderPath = `workspace-${flatLogicFunction.workspaceId}/${FileFolder.BuiltLogicFunction}/${flatLogicFunction.id}`;

      await this.fileStorageService.writeFile({
        file: builtFile,
        name: flatLogicFunction.builtHandlerPath,
        mimeType: 'application/javascript',
        folder: builtFolderPath,
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
