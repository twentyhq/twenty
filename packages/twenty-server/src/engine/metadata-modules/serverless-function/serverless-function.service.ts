import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';

import deepEqual from 'deep-equal';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ServerlessExecuteResult } from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/core-modules/file-storage/utils/read-file-content';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ENV_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/env-file-name';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';
import { getBaseTypescriptProjectFiles } from 'src/engine/core-modules/serverless/drivers/utils/get-base-typescript-project-files';
import { getLayerDependencies } from 'src/engine/core-modules/serverless/drivers/utils/get-last-layer-dependencies';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionSyncStatus,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

@Injectable()
export class ServerlessFunctionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
    @InjectRepository(ServerlessFunctionEntity, 'metadata')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly analyticsService: AnalyticsService,
    @InjectMessageQueue(MessageQueue.serverlessFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findManyServerlessFunctions(where) {
    return this.serverlessFunctionRepository.findBy(where);
  }

  async findOneOrFail({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }) {
    const serverlessFunction =
      await this.serverlessFunctionRepository.findOneBy({
        id,
        workspaceId,
      });

    if (!serverlessFunction) {
      throw new ServerlessFunctionException(
        `Function does not exist`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    return serverlessFunction;
  }

  async hasServerlessFunctionPublishedVersion(serverlessFunctionId: string) {
    return await this.serverlessFunctionRepository.exists({
      where: {
        id: serverlessFunctionId,
        latestVersion: Not(IsNull()),
      },
    });
  }

  async getServerlessFunctionSourceCode(
    workspaceId: string,
    id: string,
    version: string,
  ): Promise<{ [filePath: string]: string } | undefined> {
    const serverlessFunction = await this.findOneOrFail({
      id,
      workspaceId,
    });

    try {
      const folderPath = getServerlessFolder({
        serverlessFunction,
        version,
      });

      const indexFileStream = await this.fileStorageService.read({
        folderPath: join(folderPath, 'src'),
        filename: INDEX_FILE_NAME,
      });

      const envFileStream = await this.fileStorageService.read({
        folderPath: folderPath,
        filename: ENV_FILE_NAME,
      });

      return {
        '.env': await readFileContent(envFileStream),
        'src/index.ts': await readFileContent(indexFileStream),
      };
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        return;
      }
      throw error;
    }
  }

  async executeOneServerlessFunction(
    id: string,
    workspaceId: string,
    payload: object,
    version = 'latest',
  ): Promise<ServerlessExecuteResult> {
    await this.throttleExecution(workspaceId);

    const functionToExecute = await this.findOneOrFail({
      id,
      workspaceId,
    });

    const resultServerlessFunction = await this.serverlessService.execute(
      functionToExecute,
      payload,
      version,
    );

    const eventInput = {
      action: 'serverlessFunction.executed',
      payload: {
        duration: resultServerlessFunction.duration,
        status: resultServerlessFunction.status,
        ...(resultServerlessFunction.error && {
          errorType: resultServerlessFunction.error.errorType,
        }),
        functionId: functionToExecute.id,
        functionName: functionToExecute.name,
      },
    };

    this.analyticsService.create(
      eventInput,
      'serverless-function',
      workspaceId,
    );

    return resultServerlessFunction;
  }

  async publishOneServerlessFunction(id: string, workspaceId: string) {
    const existingServerlessFunction = await this.findOneOrFail({
      id,
      workspaceId,
    });

    if (isDefined(existingServerlessFunction.latestVersion)) {
      const latestCode = await this.getServerlessFunctionSourceCode(
        workspaceId,
        id,
        'latest',
      );
      const draftCode = await this.getServerlessFunctionSourceCode(
        workspaceId,
        id,
        'draft',
      );

      if (deepEqual(latestCode, draftCode)) {
        throw new ServerlessFunctionException(
          'Cannot publish a new version when code has not changed',
          ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CODE_UNCHANGED,
        );
      }
    }

    const newVersion = existingServerlessFunction.latestVersion
      ? `${parseInt(existingServerlessFunction.latestVersion, 10) + 1}`
      : '1';

    const draftFolderPath = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: 'draft',
    });
    const newFolderPath = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: newVersion,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftFolderPath },
      to: { folderPath: newFolderPath },
    });

    const newPublishedVersions = [
      ...existingServerlessFunction.publishedVersions,
      newVersion,
    ];

    await this.serverlessFunctionRepository.update(
      existingServerlessFunction.id,
      {
        latestVersion: newVersion,
        publishedVersions: newPublishedVersions,
      },
    );

    return this.serverlessFunctionRepository.findOneBy({
      id: existingServerlessFunction.id,
    });
  }

  async deleteOneServerlessFunction({
    id,
    workspaceId,
    isHardDeletion = true,
  }: {
    id: string;
    workspaceId: string;
    isHardDeletion?: boolean;
  }) {
    const existingServerlessFunction = await this.findOneOrFail({
      id,
      workspaceId,
    });

    if (isHardDeletion) {
      await this.serverlessFunctionRepository.delete(id);
      await this.fileStorageService.delete({
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
        }),
      });
    }

    await this.serverlessService.delete(existingServerlessFunction);

    return existingServerlessFunction;
  }

  async updateOneServerlessFunction(
    serverlessFunctionInput: UpdateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const existingServerlessFunction = await this.findOneOrFail({
      id: serverlessFunctionInput.id,
      workspaceId,
    });

    await this.serverlessFunctionRepository.update(
      existingServerlessFunction.id,
      {
        name: serverlessFunctionInput.name,
        description: serverlessFunctionInput.description,
        timeoutSeconds: serverlessFunctionInput.timeoutSeconds,
      },
    );

    const fileFolder = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: 'draft',
    });

    for (const key of Object.keys(serverlessFunctionInput.code)) {
      await this.fileStorageService.write({
        file: serverlessFunctionInput.code[key],
        name: basename(key),
        mimeType: undefined,
        folder: join(fileFolder, dirname(key)),
      });
    }

    return this.serverlessFunctionRepository.findOneBy({
      id: existingServerlessFunction.id,
    });
  }

  async getAvailablePackages(serverlessFunctionId: string) {
    const serverlessFunction =
      await this.serverlessFunctionRepository.findOneBy({
        id: serverlessFunctionId,
      });
    const { packageJson, yarnLock } = await getLayerDependencies(
      serverlessFunction?.layerVersion || 'latest',
    );

    const packageVersionRegex = /^"([^@]+)@.*?":\n\s+version: (.+)$/gm;
    const versions: Record<string, string> = {};

    let match: RegExpExecArray | null;

    while ((match = packageVersionRegex.exec(yarnLock)) !== null) {
      const packageName = match[1].split('@', 1)[0];
      const version = match[2];

      if (packageJson.dependencies[packageName]) {
        versions[packageName] = version;
      }
    }

    return versions;
  }

  async createOneServerlessFunction(
    serverlessFunctionInput: CreateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const serverlessFunctionToCreate =
      await this.serverlessFunctionRepository.create({
        ...serverlessFunctionInput,
        workspaceId,
        layerVersion: LAST_LAYER_VERSION,
        syncStatus: ServerlessFunctionSyncStatus.NOT_READY,
      });

    const createdServerlessFunction =
      await this.serverlessFunctionRepository.save(serverlessFunctionToCreate);

    const draftFileFolder = getServerlessFolder({
      serverlessFunction: createdServerlessFunction,
      version: 'draft',
    });

    for (const file of await getBaseTypescriptProjectFiles) {
      await this.fileStorageService.write({
        file: file.content,
        name: file.name,
        mimeType: undefined,
        folder: join(draftFileFolder, file.path),
      });
    }

    return this.serverlessFunctionRepository.findOneBy({
      id: createdServerlessFunction.id,
    });
  }

  async usePublishedVersionAsDraft({
    id,
    version,
    workspaceId,
  }: {
    id: string;
    version: string;
    workspaceId: string;
  }) {
    if (version === 'draft') {
      return;
    }

    const serverlessFunction = await this.findOneOrFail({
      id,
      workspaceId,
    });

    await this.fileStorageService.copy({
      from: {
        folderPath: getServerlessFolder({
          serverlessFunction: serverlessFunction,
          version,
        }),
      },
      to: {
        folderPath: getServerlessFolder({
          serverlessFunction: serverlessFunction,
          version: 'draft',
        }),
      },
    });
  }

  private async throttleExecution(workspaceId: string) {
    try {
      await this.throttlerService.throttle(
        `${workspaceId}-serverless-function-execution`,
        this.twentyConfigService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new ServerlessFunctionException(
        'Serverless function execution rate limit exceeded',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED,
      );
    }
  }
}
