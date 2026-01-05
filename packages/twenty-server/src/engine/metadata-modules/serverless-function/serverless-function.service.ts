import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import deepEqual from 'deep-equal';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';
import { Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type ServerlessExecuteResult } from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { SERVERLESS_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/serverless-function/serverless-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { buildEnvVar } from 'src/engine/core-modules/serverless/drivers/utils/build-env-var';
import { getBaseTypescriptProjectFiles } from 'src/engine/core-modules/serverless/drivers/utils/get-base-typescript-project-files';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { DEFAULT_TOOL_INPUT_SCHEMA } from 'src/engine/metadata-modules/serverless-function/constants/default-tool-input-schema.constant';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { type UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { cleanServerUrl } from 'src/utils/clean-server-url';

const MIN_TOKEN_EXPIRATION_IN_SECONDS = 5;

@Injectable()
export class ServerlessFunctionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly auditService: AuditService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

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
  ): Promise<Sources | undefined> {
    const serverlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });

    try {
      const folderPath = getServerlessFolder({
        serverlessFunction,
        version,
      });

      return await this.fileStorageService.readFolder(folderPath);
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        return;
      }
      throw error;
    }
  }

  async executeOneServerlessFunction({
    id,
    workspaceId,
    payload,
    version = 'latest',
  }: {
    id: string;
    workspaceId: string;
    payload: object;
    version?: string;
  }): Promise<ServerlessExecuteResult> {
    await this.throttleExecution(workspaceId);

    const functionToExecute =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
        relations: [
          'serverlessFunctionLayer',
          'application.applicationVariables',
        ],
      });

    const applicationAccessToken = isDefined(functionToExecute.applicationId)
      ? await this.applicationTokenService.generateApplicationToken({
          workspaceId,
          applicationId: functionToExecute.applicationId,
          expiresInSeconds: Math.max(
            functionToExecute.timeoutSeconds,
            MIN_TOKEN_EXPIRATION_IN_SECONDS,
          ),
        })
      : undefined;

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    const envVariables = {
      ...(isDefined(baseUrl)
        ? {
            [DEFAULT_API_URL_NAME]: baseUrl,
          }
        : {}),
      ...(isDefined(applicationAccessToken)
        ? {
            [DEFAULT_API_KEY_NAME]: applicationAccessToken.token,
          }
        : {}),
      ...buildEnvVar(functionToExecute),
    };

    const resultServerlessFunction = await this.callWithTimeout({
      callback: () =>
        this.serverlessService.execute({
          serverlessFunction: functionToExecute,
          payload,
          version,
          env: envVariables,
        }),
      timeoutMs: functionToExecute.timeoutSeconds * 1000,
    });

    if (this.twentyConfigService.get('SERVERLESS_LOGS_ENABLED')) {
      /* eslint-disable no-console */
      console.log(resultServerlessFunction.logs);
    }

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.SERVERLESS_FUNCTION_LOGS_CHANNEL,
      workspaceId,
      payload: {
        serverlessFunctionLogs: {
          logs: resultServerlessFunction.logs,
          id: functionToExecute.id,
          name: functionToExecute.name,
          universalIdentifier: functionToExecute.universalIdentifier,
          applicationId: functionToExecute.applicationId,
          applicationUniversalIdentifier:
            functionToExecute.application?.universalIdentifier,
        },
      },
    });

    this.auditService
      .createContext({
        workspaceId,
      })
      .insertWorkspaceEvent(SERVERLESS_FUNCTION_EXECUTED_EVENT, {
        duration: resultServerlessFunction.duration,
        status: resultServerlessFunction.status,
        ...(resultServerlessFunction.error && {
          errorType: resultServerlessFunction.error.errorType,
        }),
        functionId: functionToExecute.id,
        functionName: functionToExecute.name,
      });

    return resultServerlessFunction;
  }

  async publishOneServerlessFunctionOrFail(id: string, workspaceId: string) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
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
        return existingServerlessFunction;
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

    const publishedServerlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });

    // This check should never be thrown, but we encounter some issue with
    // publishing serverless function in self hosted instances
    // See https://github.com/twentyhq/twenty/issues/13058
    // TODO: remove this check when issue solved
    if (!isDefined(publishedServerlessFunction.latestVersion)) {
      throw new WorkflowVersionStepException(
        `Fail to publish serverlessFunction ${publishedServerlessFunction.id}.Received latest version ${publishedServerlessFunction.latestVersion}`,
        WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
      );
    }

    return publishedServerlessFunction;
  }

  async deleteOneServerlessFunction({
    id,
    workspaceId,
    softDelete = false,
  }: {
    id: string;
    workspaceId: string;
    softDelete?: boolean;
  }) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });

    if (softDelete) {
      await this.serverlessFunctionRepository.softDelete({ id });
    } else {
      await this.serverlessFunctionRepository.delete({ id });
      // We don't need to await this
      this.fileStorageService.delete({
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
        }),
      });
    }

    // We don't need to await this
    this.serverlessService.delete(existingServerlessFunction);

    return existingServerlessFunction;
  }

  async restoreOneServerlessFunction(id: string) {
    await this.serverlessFunctionRepository.restore({ id });
  }

  async updateOneServerlessFunction(
    serverlessFunctionInput: UpdateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const existingServerlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id: serverlessFunctionInput.id,
          workspaceId,
        },
      });

    await this.serverlessFunctionRepository.update(
      existingServerlessFunction.id,
      {
        name: serverlessFunctionInput.update.name,
        description: serverlessFunctionInput.update.description,
        timeoutSeconds: serverlessFunctionInput.update.timeoutSeconds,
        toolInputSchema: serverlessFunctionInput.update.toolInputSchema,
        isTool: serverlessFunctionInput.update.isTool,
      },
    );

    const fileFolder = getServerlessFolder({
      serverlessFunction: existingServerlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.writeFolder(
      serverlessFunctionInput.update.code,
      fileFolder,
    );

    return this.serverlessFunctionRepository.findOneBy({
      id: existingServerlessFunction.id,
    });
  }

  async getAvailablePackages(serverlessFunctionId: string) {
    const serverlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: { id: serverlessFunctionId },
        relations: ['serverlessFunctionLayer'],
      });

    const packageJson = serverlessFunction.serverlessFunctionLayer.packageJson;

    const yarnLock = serverlessFunction.serverlessFunctionLayer.yarnLock;

    const packageVersionRegex = /^"([^@]+)@.*?":\n\s+version: (.+)$/gm;

    const versions: Record<string, string> = {};

    let match: RegExpExecArray | null;

    while ((match = packageVersionRegex.exec(yarnLock)) !== null) {
      const packageName = match[1].split('@', 1)[0];
      const version = match[2];

      // @ts-expect-error legacy noImplicitAny
      if (packageJson.dependencies?.[packageName]) {
        versions[packageName] = version;
      }
    }

    return versions;
  }

  async createOneServerlessFunction(
    serverlessFunctionInput: CreateServerlessFunctionInput & {
      serverlessFunctionLayerId?: string;
    },
    workspaceId: string,
  ) {
    let serverlessFunctionToCreateLayerId =
      serverlessFunctionInput.serverlessFunctionLayerId;

    if (!isDefined(serverlessFunctionToCreateLayerId)) {
      const { id: commonServerlessFunctionLayerId } =
        await this.serverlessFunctionLayerService.createCommonLayerIfNotExist(
          workspaceId,
        );

      serverlessFunctionToCreateLayerId = commonServerlessFunctionLayerId;
    }

    const createServerlessFunctionInput: CreateServerlessFunctionInput = {
      ...serverlessFunctionInput,
      serverlessFunctionLayerId: serverlessFunctionToCreateLayerId,
    };

    // If no toolInputSchema is provided, use the default schema
    // (because the default template will be used for the code)
    const toolInputSchema = isDefined(serverlessFunctionInput.toolInputSchema)
      ? serverlessFunctionInput.toolInputSchema
      : DEFAULT_TOOL_INPUT_SCHEMA;

    const serverlessFunctionToCreate = this.serverlessFunctionRepository.create(
      { ...createServerlessFunctionInput, workspaceId, toolInputSchema },
    );

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

  async createDraftFromPublishedVersion({
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

    const serverlessFunction =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
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

  async duplicateServerlessFunction({
    id,
    version,
    workspaceId,
  }: {
    id: string;
    version: string;
    workspaceId: string;
  }) {
    const serverlessFunctionToDuplicate =
      await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });

    const newServerlessFunction = await this.createOneServerlessFunction(
      {
        name: serverlessFunctionToDuplicate.name,
        description: serverlessFunctionToDuplicate.description ?? undefined,
        timeoutSeconds: serverlessFunctionToDuplicate.timeoutSeconds,
        applicationId: serverlessFunctionToDuplicate.applicationId ?? undefined,
        serverlessFunctionLayerId:
          serverlessFunctionToDuplicate.serverlessFunctionLayerId,
      },
      workspaceId,
    );

    if (!isDefined(newServerlessFunction)) {
      throw new ServerlessFunctionException(
        'Failed to create new serverless function',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CREATE_FAILED,
      );
    }

    await this.fileStorageService.copy({
      from: {
        folderPath: getServerlessFolder({
          serverlessFunction: serverlessFunctionToDuplicate,
          version,
        }),
      },
      to: {
        folderPath: getServerlessFolder({
          serverlessFunction: newServerlessFunction,
          version: 'draft',
        }),
      },
    });

    return newServerlessFunction;
  }

  private async throttleExecution(workspaceId: string) {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${workspaceId}-serverless-function-execution`,
        1,
        this.twentyConfigService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL'),
      );
    } catch {
      throw new ServerlessFunctionException(
        'Serverless function execution rate limit exceeded',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED,
      );
    }
  }

  private async callWithTimeout<T>({
    callback,
    timeoutMs,
  }: {
    callback: () => Promise<T>;
    timeoutMs: number;
  }): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new ServerlessFunctionException(
              `Execution timeout: ${timeoutMs / 1000}s`,
              ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_TIMEOUT,
            ),
          ),
        timeoutMs,
      );
    });

    return Promise.race([callback(), timeoutPromise]).finally(() =>
      clearTimeout(timeoutId),
    ) as Promise<T>;
  }
}
