import { Injectable } from '@nestjs/common';

import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function-executor/drivers/utils/lambda-build-directory-manager';
import { getLogicFunctionFolderOrThrow } from 'src/engine/core-modules/logic-function-executor/utils/get-logic-function-folder-or-throw.utils';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

@Injectable()
export class FunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async isBuilt({
    flatLogicFunction,
    version,
  }: {
    flatLogicFunction: FlatLogicFunction;
    version: string;
  }): Promise<boolean> {
    const folderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction,
      version,
    });

    return await this.fileStorageService.checkFileExists({
      folderPath,
      filename: flatLogicFunction.builtHandlerPath,
    });
  }

  async buildAndUpload({
    flatLogicFunction,
    version,
  }: {
    flatLogicFunction: FlatLogicFunction;
    version: string;
  }): Promise<void> {
    const sourceFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction,
      version,
      fileFolder: FileFolder.LogicFunction,
    });

    const builtFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction,
      version,
      fileFolder: FileFolder.BuiltFunction,
    });

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.fileStorageService.download({
        from: { folderPath: sourceFolderPath },
        to: { folderPath: sourceTemporaryDir },
      });

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        builtHandlerPath: flatLogicFunction.builtHandlerPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.write({
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
