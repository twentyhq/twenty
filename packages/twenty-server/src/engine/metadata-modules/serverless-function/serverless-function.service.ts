import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import deepEqual from 'deep-equal';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type ServerlessExecuteResult } from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { SERVERLESS_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/serverless-function/serverless-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { buildEnvVar } from 'src/engine/core-modules/serverless/drivers/utils/build-env-var';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { type UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { findFlatServerlessFunctionOrThrow } from 'src/engine/metadata-modules/serverless-function/utils/find-flat-serverless-function-or-throw.util';
import { fromCreateServerlessFunctionInputToFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/from-create-serverless-function-input-to-flat-serverless-function.util';
import { fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/serverless-function/utils/from-update-serverless-function-input-to-flat-serverless-function-to-update-or-throw.util';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async hasServerlessFunctionPublishedVersion(
    serverlessFunctionId: string,
    workspaceId: string,
  ) {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const flatServerlessFunction =
      flatServerlessFunctionMaps.byId[serverlessFunctionId];

    return (
      isDefined(flatServerlessFunction) &&
      isDefined(flatServerlessFunction.latestVersion)
    );
  }

  async getServerlessFunctionSourceCode(
    workspaceId: string,
    id: string,
    version: string,
  ) {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const flatServerlessFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: flatServerlessFunctionMaps,
    });

    try {
      const folderPath = getServerlessFolderOrThrow({
        flatServerlessFunction: flatServerlessFunction,
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

    const {
      flatServerlessFunctionMaps,
      flatApplicationMaps,
      applicationVariableMaps,
      serverlessFunctionLayerMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatServerlessFunctionMaps',
      'flatApplicationMaps',
      'applicationVariableMaps',
      'serverlessFunctionLayerMaps',
    ]);

    const flatServerlessFunction = findFlatServerlessFunctionOrThrow({
      id,
      flatServerlessFunctionMaps,
    });

    const flatServerlessFunctionLayer =
      serverlessFunctionLayerMaps.byId[
        flatServerlessFunction.serverlessFunctionLayerId
      ];

    if (!isDefined(flatServerlessFunctionLayer)) {
      throw new ServerlessFunctionException(
        `Serverless function layer with id ${flatServerlessFunction.serverlessFunctionLayerId} not found`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    const applicationAccessToken = isDefined(
      flatServerlessFunction.applicationId,
    )
      ? await this.applicationTokenService.generateApplicationToken({
          workspaceId,
          applicationId: flatServerlessFunction.applicationId,
          expiresInSeconds: Math.max(
            flatServerlessFunction.timeoutSeconds,
            MIN_TOKEN_EXPIRATION_IN_SECONDS,
          ),
        })
      : undefined;

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    const flatApplicationVariables = isDefined(
      flatServerlessFunction.applicationId,
    )
      ? (applicationVariableMaps.byApplicationId[
          flatServerlessFunction.applicationId
        ] ?? [])
      : [];

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
      ...buildEnvVar(flatApplicationVariables),
    };

    const resultServerlessFunction = await this.callWithTimeout({
      callback: () =>
        this.serverlessService.execute({
          flatServerlessFunction,
          flatServerlessFunctionLayer,
          payload,
          version,
          env: envVariables,
        }),
      timeoutMs: flatServerlessFunction.timeoutSeconds * 1000,
    });

    if (this.twentyConfigService.get('SERVERLESS_LOGS_ENABLED')) {
      /* eslint-disable no-console */
      console.log(resultServerlessFunction.logs);
    }

    const applicationUniversalIdentifier = isDefined(
      flatServerlessFunction.applicationId,
    )
      ? flatApplicationMaps.byId[flatServerlessFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.SERVERLESS_FUNCTION_LOGS_CHANNEL,
      workspaceId,
      payload: {
        serverlessFunctionLogs: {
          logs: resultServerlessFunction.logs,
          id: flatServerlessFunction.id,
          name: flatServerlessFunction.name,
          universalIdentifier: flatServerlessFunction.universalIdentifier,
          applicationId: flatServerlessFunction.applicationId,
          applicationUniversalIdentifier,
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
        functionId: flatServerlessFunction.id,
        functionName: flatServerlessFunction.name,
      });

    return resultServerlessFunction;
  }

  async publishOneServerlessFunctionOrFail(
    id: string,
    workspaceId: string,
  ): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    if (isDefined(existingFlatServerlessFunction.latestVersion)) {
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
        return existingFlatServerlessFunction;
      }
    }

    const newVersion = existingFlatServerlessFunction.latestVersion
      ? `${parseInt(existingFlatServerlessFunction.latestVersion, 10) + 1}`
      : '1';

    const draftFolderPath = getServerlessFolderOrThrow({
      flatServerlessFunction: existingFlatServerlessFunction,
      version: 'draft',
    });

    const newFolderPath = getServerlessFolderOrThrow({
      flatServerlessFunction: existingFlatServerlessFunction,
      version: newVersion,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftFolderPath },
      to: { folderPath: newFolderPath },
    });

    const newPublishedVersions = [
      ...existingFlatServerlessFunction.publishedVersions,
      newVersion,
    ];

    const updatedFlatServerlessFunction: FlatServerlessFunction = {
      ...existingFlatServerlessFunction,
      latestVersion: newVersion,
      publishedVersions: newPublishedVersions,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedFlatServerlessFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while publishing serverless function',
      );
    }

    const { flatServerlessFunctionMaps: recomputedFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const publishedFlatServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatServerlessFunctionMaps,
      });

    if (!isDefined(publishedFlatServerlessFunction.latestVersion)) {
      throw new WorkflowVersionStepException(
        `Fail to publish serverlessFunction ${publishedFlatServerlessFunction.id}.Received latest version ${publishedFlatServerlessFunction.latestVersion}`,
        WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
      );
    }

    return publishedFlatServerlessFunction;
  }

  async deleteOneServerlessFunction({
    id,
    workspaceId,
    softDelete = false,
  }: {
    id: string;
    workspaceId: string;
    softDelete?: boolean;
  }): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunction = flatServerlessFunctionMaps.byId[id];

    if (!isDefined(existingFlatServerlessFunction)) {
      throw new ServerlessFunctionException(
        'Serverless function to delete not found',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    if (softDelete) {
      const updatedFlatServerlessFunctionWithDeletedAt: FlatServerlessFunction =
        {
          ...existingFlatServerlessFunction,
          deletedAt: new Date().toISOString(),
        };

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              serverlessFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: [
                  updatedFlatServerlessFunctionWithDeletedAt,
                ],
              },
            },
            workspaceId,
            isSystemBuild: false,
          },
        );

      if (isDefined(validateAndBuildResult)) {
        throw new WorkspaceMigrationBuilderException(
          validateAndBuildResult,
          'Multiple validation errors occurred while deleting serverless function',
        );
      }

      return updatedFlatServerlessFunctionWithDeletedAt;
    } else {
      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              serverlessFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [existingFlatServerlessFunction],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            isSystemBuild: false,
          },
        );

      if (isDefined(validateAndBuildResult)) {
        throw new WorkspaceMigrationBuilderException(
          validateAndBuildResult,
          'Multiple validation errors occurred while destroying serverless function',
        );
      }
    }

    return existingFlatServerlessFunction;
  }

  async restoreOneServerlessFunction(
    id: string,
    workspaceId: string,
  ): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunction = flatServerlessFunctionMaps.byId[id];

    if (!isDefined(existingFlatServerlessFunction)) {
      throw new ServerlessFunctionException(
        'Serverless function to restore not found',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    const restoredFlatServerlessFunction: FlatServerlessFunction = {
      ...existingFlatServerlessFunction,
      deletedAt: null,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [restoredFlatServerlessFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring serverless function',
      );
    }

    const { flatServerlessFunctionMaps: recomputedFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatServerlessFunctionMaps,
    });
  }

  async updateOneServerlessFunction(
    serverlessFunctionInput: UpdateServerlessFunctionInput,
    workspaceId: string,
  ): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const updatedFlatServerlessFunction =
      fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow({
        flatServerlessFunctionMaps,
        updateServerlessFunctionInput: serverlessFunctionInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedFlatServerlessFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating serverless function',
      );
    }

    const { flatServerlessFunctionMaps: recomputedFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: updatedFlatServerlessFunction.id,
      flatEntityMaps: recomputedFlatServerlessFunctionMaps,
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
  ): Promise<FlatServerlessFunction> {
    let serverlessFunctionToCreateLayerId =
      serverlessFunctionInput.serverlessFunctionLayerId;

    if (!isDefined(serverlessFunctionToCreateLayerId)) {
      const { id: commonServerlessFunctionLayerId } =
        await this.serverlessFunctionLayerService.createCommonLayerIfNotExist(
          workspaceId,
        );

      serverlessFunctionToCreateLayerId = commonServerlessFunctionLayerId;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatServerlessFunctionToCreate =
      fromCreateServerlessFunctionInputToFlatServerlessFunction({
        createServerlessFunctionInput: {
          ...serverlessFunctionInput,
          serverlessFunctionLayerId: serverlessFunctionToCreateLayerId,
        },
        workspaceId,
        workspaceCustomApplicationId:
          serverlessFunctionInput.applicationId ??
          workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [flatServerlessFunctionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating serverless function',
      );
    }

    const { flatServerlessFunctionMaps: recomputedFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatServerlessFunctionToCreate.id,
      flatEntityMaps: recomputedFlatServerlessFunctionMaps,
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

    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const flatServerlessFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: flatServerlessFunctionMaps,
    });

    await this.fileStorageService.copy({
      from: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction: flatServerlessFunction,
          version,
        }),
      },
      to: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction: flatServerlessFunction,
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
  }): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const flatServerlessFunctionToDuplicate =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    const newFlatServerlessFunction = await this.createOneServerlessFunction(
      {
        name: flatServerlessFunctionToDuplicate.name,
        description: flatServerlessFunctionToDuplicate.description ?? undefined,
        timeoutSeconds: flatServerlessFunctionToDuplicate.timeoutSeconds,
        applicationId:
          flatServerlessFunctionToDuplicate.applicationId ?? undefined,
        serverlessFunctionLayerId:
          flatServerlessFunctionToDuplicate.serverlessFunctionLayerId,
      },
      workspaceId,
    );

    await this.fileStorageService.copy({
      from: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction: flatServerlessFunctionToDuplicate,
          version,
        }),
      },
      to: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction: newFlatServerlessFunction,
          version: 'draft',
        }),
      },
    });

    return newFlatServerlessFunction;
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
