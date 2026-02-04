import { Injectable } from '@nestjs/common';

import crypto from 'crypto';
import fs from 'fs/promises';
import { dirname, join } from 'path';

import { isObject } from '@sniptt/guards';
import { build } from 'esbuild';
import { FileFolder, Sources } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import {
  getLogicFunctionBaseFolderPath,
  getRelativePathFromBase,
} from 'src/engine/core-modules/logic-function/utils/get-logic-function-base-folder-path.util';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_SOURCE_HANDLER_PATH,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { getCodeStepSeedProjectFiles } from 'src/modules/workflow/code-step-build/utils/get-code-step-seed-project-files.util';

const WORKFLOW_BASE_FOLDER_PREFIX = 'workflow';

type BuildFromSourceToBuiltParams = {
  flatLogicFunction: FlatLogicFunction;
  applicationUniversalIdentifier: string;
};

type SeedCodeStepFilesParams = {
  logicFunctionId: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type SeedCodeStepFilesResult = {
  sourceHandlerPath: string;
  builtHandlerPath: string;
  checksum: string;
};

type UpdateCodeStepSourceParams = {
  flatLogicFunction: FlatLogicFunction;
  code: Sources;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class CodeStepBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async seedCodeStepFiles({
    logicFunctionId,
    workspaceId,
    applicationUniversalIdentifier,
  }: SeedCodeStepFilesParams): Promise<SeedCodeStepFilesResult> {
    const sourceHandlerPath = `${WORKFLOW_BASE_FOLDER_PREFIX}/${logicFunctionId}/${DEFAULT_SOURCE_HANDLER_PATH}`;
    const builtHandlerPath = `${WORKFLOW_BASE_FOLDER_PREFIX}/${logicFunctionId}/${DEFAULT_BUILT_HANDLER_PATH}`;

    const seedProjectFiles = await getCodeStepSeedProjectFiles();

    const sourceFiles = seedProjectFiles.filter((file) =>
      file.name.endsWith('index.ts'),
    );
    const builtFiles = seedProjectFiles.filter((file) =>
      file.name.endsWith('.mjs'),
    );

    if (sourceFiles.length !== 1 || builtFiles.length !== 1) {
      throw new Error(
        'Code step seed project should have one index.ts file and one index.mjs file',
      );
    }

    const sourceFile = sourceFiles[0];
    const builtFile = builtFiles[0];

    await this.fileStorageService.writeFile_v2({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      sourceFile: sourceFile.content,
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile_v2({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      sourceFile: builtFile.content,
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    const checksum = crypto
      .createHash('md5')
      .update(builtFile.content)
      .digest('hex');

    return {
      sourceHandlerPath,
      builtHandlerPath,
      checksum,
    };
  }

  isWorkflowCodeStepLogicFunction(
    flatLogicFunction: FlatLogicFunction,
  ): boolean {
    return (
      flatLogicFunction.sourceHandlerPath.startsWith(
        `${WORKFLOW_BASE_FOLDER_PREFIX}/`,
      ) ||
      flatLogicFunction.builtHandlerPath.startsWith(
        `${WORKFLOW_BASE_FOLDER_PREFIX}/`,
      )
    );
  }

  async copySourceAndBuiltForNewCodeStep({
    existingFlatLogicFunction,
    newFlatLogicFunction,
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    existingFlatLogicFunction: FlatLogicFunction;
    newFlatLogicFunction: FlatLogicFunction;
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    const fromSourceBaseFolderPath = getLogicFunctionBaseFolderPath(
      existingFlatLogicFunction.sourceHandlerPath,
    );
    const toSourceBaseFolderPath = getLogicFunctionBaseFolderPath(
      newFlatLogicFunction.sourceHandlerPath,
    );
    const fromBuiltBaseFolderPath = getLogicFunctionBaseFolderPath(
      existingFlatLogicFunction.builtHandlerPath,
    );
    const toBuiltBaseFolderPath = getLogicFunctionBaseFolderPath(
      newFlatLogicFunction.builtHandlerPath,
    );

    await this.fileStorageService.copy_v2({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: fromSourceBaseFolderPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: toSourceBaseFolderPath,
      },
    });

    await this.fileStorageService.copy_v2({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: fromBuiltBaseFolderPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: toBuiltBaseFolderPath,
      },
    });
  }

  async updateCodeStepSource({
    flatLogicFunction,
    code,
    applicationUniversalIdentifier,
  }: UpdateCodeStepSourceParams): Promise<void> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.writeSourcesToLocalFolder(code, sourceTemporaryDir);

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        flatLogicFunction.sourceHandlerPath,
      );

      await this.fileStorageService.uploadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }

  private async writeSourcesToLocalFolder(
    sources: Sources,
    localPath: string,
  ): Promise<void> {
    for (const key of Object.keys(sources)) {
      const filePath = join(localPath, key);
      const value = sources[key];

      if (isObject(value)) {
        await this.writeSourcesToLocalFolder(value as Sources, filePath);
        continue;
      }
      await fs.mkdir(dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value);
    }
  }

  async buildFromSourceToBuilt({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: BuildFromSourceToBuiltParams): Promise<{ checksum: string }> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        flatLogicFunction.sourceHandlerPath,
      );

      await this.fileStorageService.downloadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });

      const relativeSourcePath = getRelativePathFromBase(
        flatLogicFunction.sourceHandlerPath,
        baseFolderPath,
      );
      const relativeBuiltPath = getRelativePathFromBase(
        flatLogicFunction.builtHandlerPath,
        baseFolderPath,
      );

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: relativeSourcePath,
        builtHandlerPath: relativeBuiltPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.writeFile_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: flatLogicFunction.builtHandlerPath,
        sourceFile: builtFile,
        mimeType: 'application/javascript',
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      return {
        checksum: crypto.createHash('md5').update(builtFile).digest('hex'),
      };
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

    await fs.mkdir(dirname(builtBundleFilePath), { recursive: true });

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
