import { Injectable } from '@nestjs/common';

import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/get-serverless-folder-or-throw.utils';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

@Injectable()
export class FunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async isBuilt({
    flatServerlessFunction,
    version,
  }: {
    flatServerlessFunction: FlatServerlessFunction;
    version: string;
  }): Promise<boolean> {
    const folderPath = getServerlessFolderOrThrow({
      flatServerlessFunction,
      version,
    });

    return await this.fileStorageService.checkFileExists({
      folderPath,
      filename: flatServerlessFunction.builtHandlerPath,
    });
  }

  async buildAndUpload({
    flatServerlessFunction,
    version,
  }: {
    flatServerlessFunction: FlatServerlessFunction;
    version: string;
  }): Promise<void> {
    const sourceFolderPath = getServerlessFolderOrThrow({
      flatServerlessFunction,
      version,
      fileFolder: FileFolder.ServerlessFunction,
    });

    const builtFolderPath = getServerlessFolderOrThrow({
      flatServerlessFunction,
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
        sourceHandlerPath: flatServerlessFunction.sourceHandlerPath,
        builtHandlerPath: flatServerlessFunction.builtHandlerPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.write({
        file: builtFile,
        name: flatServerlessFunction.builtHandlerPath,
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
