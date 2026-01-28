import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import deepEqual from 'deep-equal';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function-executor/drivers/interfaces/logic-function-executor-driver.interface';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { LOGIC_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/logic-function/logic-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { buildEnvVar } from 'src/engine/core-modules/logic-function-executor/drivers/utils/build-env-var';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.service';
import { getLogicFunctionFolderOrThrow } from 'src/engine/core-modules/logic-function-executor/utils/get-logic-function-folder-or-throw.utils';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionLayerService } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.service';
import { CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import { type UpdateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-input-to-flat-logic-function.util';
import { fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/logic-function/utils/from-update-logic-function-input-to-flat-logic-function-to-update-or-throw.util';
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
import { FunctionBuildService } from 'src/engine/metadata-modules/function-build/function-build.service';

const MIN_TOKEN_EXPIRATION_IN_SECONDS = 5;

@Injectable()
export class LogicFunctionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly functionBuildService: FunctionBuildService,
    private readonly logicFunctionLayerService: LogicFunctionLayerService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly auditService: AuditService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly subscriptionService: SubscriptionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async hasLogicFunctionPublishedVersion(
    logicFunctionId: string,
    workspaceId: string,
  ) {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    return (
      isDefined(flatLogicFunction) &&
      !isDefined(flatLogicFunction.deletedAt) &&
      isDefined(flatLogicFunction.latestVersion)
    );
  }

  async getLogicFunctionSourceCode(
    workspaceId: string,
    id: string,
    version: string,
  ) {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    try {
      const folderPath = getLogicFunctionFolderOrThrow({
        flatLogicFunction,
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

  async executeOneLogicFunction({
    id,
    workspaceId,
    payload,
    version = 'latest',
  }: {
    id: string;
    workspaceId: string;
    payload: object;
    version?: string;
  }): Promise<LogicFunctionExecuteResult> {
    await this.throttleExecution(workspaceId);

    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      applicationVariableMaps,
      logicFunctionLayerMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatLogicFunctionMaps',
      'flatApplicationMaps',
      'applicationVariableMaps',
      'logicFunctionLayerMaps',
    ]);

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    const flatLogicFunctionLayer =
      logicFunctionLayerMaps.byId[flatLogicFunction.logicFunctionLayerId];

    if (!isDefined(flatLogicFunctionLayer)) {
      throw new LogicFunctionException(
        `Logic function layer with id ${flatLogicFunction.logicFunctionLayerId} not found`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const applicationAccessToken = isDefined(flatLogicFunction.applicationId)
      ? await this.applicationTokenService.generateApplicationToken({
          workspaceId,
          applicationId: flatLogicFunction.applicationId,
          expiresInSeconds: Math.max(
            flatLogicFunction.timeoutSeconds,
            MIN_TOKEN_EXPIRATION_IN_SECONDS,
          ),
        })
      : undefined;

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    const flatApplicationVariables = isDefined(flatLogicFunction.applicationId)
      ? (applicationVariableMaps.byApplicationId[
          flatLogicFunction.applicationId
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
      ...buildEnvVar(flatApplicationVariables, this.secretEncryptionService),
    };

    // We keep that check to build functions
    if (
      !(await this.functionBuildService.isBuilt({
        flatLogicFunction,
        version,
      }))
    ) {
      await this.functionBuildService.buildAndUpload({
        flatLogicFunction,
        version,
      });
    }

    const resultLogicFunction = await this.callWithTimeout({
      callback: () =>
        this.logicFunctionExecutorService.execute({
          flatLogicFunction,
          flatLogicFunctionLayer,
          payload,
          version,
          env: envVariables,
        }),
      timeoutMs: flatLogicFunction.timeoutSeconds * 1000,
    });

    if (this.twentyConfigService.get('LOGIC_FUNCTION_LOGS_ENABLED')) {
      /* eslint-disable no-console */
      console.log(resultLogicFunction.logs);
    }

    const applicationUniversalIdentifier = isDefined(
      flatLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId,
      payload: {
        logicFunctionLogs: {
          logs: resultLogicFunction.logs,
          id: flatLogicFunction.id,
          name: flatLogicFunction.name,
          universalIdentifier: flatLogicFunction.universalIdentifier,
          applicationId: flatLogicFunction.applicationId,
          applicationUniversalIdentifier,
        },
      },
    });

    this.auditService
      .createContext({
        workspaceId,
      })
      .insertWorkspaceEvent(LOGIC_FUNCTION_EXECUTED_EVENT, {
        duration: resultLogicFunction.duration,
        status: resultLogicFunction.status,
        ...(resultLogicFunction.error && {
          errorType: resultLogicFunction.error.errorType,
        }),
        functionId: flatLogicFunction.id,
        functionName: flatLogicFunction.name,
      });

    return resultLogicFunction;
  }

  async publishOneLogicFunctionOrFail(
    id: string,
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    if (isDefined(existingFlatLogicFunction.latestVersion)) {
      const latestCode = await this.getLogicFunctionSourceCode(
        workspaceId,
        id,
        'latest',
      );
      const draftCode = await this.getLogicFunctionSourceCode(
        workspaceId,
        id,
        'draft',
      );

      if (deepEqual(latestCode, draftCode)) {
        return existingFlatLogicFunction;
      }
    }

    const newVersion = existingFlatLogicFunction.latestVersion
      ? `${parseInt(existingFlatLogicFunction.latestVersion, 10) + 1}`
      : '1';

    const draftSourceFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction: existingFlatLogicFunction,
      version: 'draft',
      fileFolder: FileFolder.LogicFunction,
    });

    const newSourceFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction: existingFlatLogicFunction,
      version: newVersion,
      fileFolder: FileFolder.LogicFunction,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftSourceFolderPath },
      to: { folderPath: newSourceFolderPath },
    });

    const draftBuiltFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction: existingFlatLogicFunction,
      version: 'draft',
      fileFolder: FileFolder.BuiltFunction,
    });

    const newBuiltFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction: existingFlatLogicFunction,
      version: newVersion,
      fileFolder: FileFolder.BuiltFunction,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftBuiltFolderPath },
      to: { folderPath: newBuiltFolderPath },
    });

    const newPublishedVersions = [
      ...existingFlatLogicFunction.publishedVersions,
      newVersion,
    ];

    const updatedFlatLogicFunction: FlatLogicFunction = {
      ...existingFlatLogicFunction,
      latestVersion: newVersion,
      publishedVersions: newPublishedVersions,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while publishing logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const publishedFlatLogicFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatLogicFunctionMaps,
      });

    if (!isDefined(publishedFlatLogicFunction.latestVersion)) {
      throw new WorkflowVersionStepException(
        `Fail to publish logicFunction ${publishedFlatLogicFunction.id}.Received latest version ${publishedFlatLogicFunction.latestVersion}`,
        WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
      );
    }

    return publishedFlatLogicFunction;
  }

  async deleteOneLogicFunction({
    id,
    workspaceId,
    softDelete = false,
  }: {
    id: string;
    workspaceId: string;
    softDelete?: boolean;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = flatLogicFunctionMaps.byId[id];

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to delete not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (softDelete) {
      const updatedFlatLogicFunctionWithDeletedAt: FlatLogicFunction = {
        ...existingFlatLogicFunction,
        deletedAt: new Date().toISOString(),
      };

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              logicFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: [updatedFlatLogicFunctionWithDeletedAt],
              },
            },
            workspaceId,
            isSystemBuild: false,
          },
        );

      if (isDefined(validateAndBuildResult)) {
        throw new WorkspaceMigrationBuilderException(
          validateAndBuildResult,
          'Multiple validation errors occurred while deleting logic function',
        );
      }

      return updatedFlatLogicFunctionWithDeletedAt;
    } else {
      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              logicFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [existingFlatLogicFunction],
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
          'Multiple validation errors occurred while destroying logic function',
        );
      }
    }

    return existingFlatLogicFunction;
  }

  async restoreOneLogicFunction(
    id: string,
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = flatLogicFunctionMaps.byId[id];

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to restore not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const restoredFlatLogicFunction: FlatLogicFunction = {
      ...existingFlatLogicFunction,
      deletedAt: null,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [restoredFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  async updateOneLogicFunction(
    logicFunctionInput: UpdateLogicFunctionInput,
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const updatedFlatLogicFunction =
      fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow({
        flatLogicFunctionMaps,
        updateLogicFunctionInput: logicFunctionInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: updatedFlatLogicFunction.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  async getAvailablePackages(logicFunctionId: string) {
    const logicFunction = await this.logicFunctionRepository.findOneOrFail({
      where: { id: logicFunctionId },
      relations: ['logicFunctionLayer'],
    });

    const packageJson = logicFunction.logicFunctionLayer.packageJson;

    const yarnLock = logicFunction.logicFunctionLayer.yarnLock;

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

  async createOneLogicFunction(
    logicFunctionInput: CreateLogicFunctionInput & {
      logicFunctionLayerId?: string;
    },
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    let logicFunctionToCreateLayerId = logicFunctionInput.logicFunctionLayerId;

    if (!isDefined(logicFunctionToCreateLayerId)) {
      const { id: commonLogicFunctionLayerId } =
        await this.logicFunctionLayerService.createCommonLayerIfNotExist(
          workspaceId,
        );

      logicFunctionToCreateLayerId = commonLogicFunctionLayerId;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatLogicFunctionToCreate =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: {
          ...logicFunctionInput,
          logicFunctionLayerId: logicFunctionToCreateLayerId,
        },
        workspaceId,
        workspaceCustomApplicationId:
          logicFunctionInput.applicationId ?? workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [flatLogicFunctionToCreate],
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
        'Multiple validation errors occurred while creating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatLogicFunctionToCreate.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
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

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    await this.fileStorageService.copy({
      from: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          version,
        }),
      },
      to: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          version: 'draft',
        }),
      },
    });
  }

  async duplicateLogicFunction({
    id,
    version,
    workspaceId,
  }: {
    id: string;
    version: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunctionToDuplicate = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    const newFlatLogicFunction = await this.createOneLogicFunction(
      {
        name: flatLogicFunctionToDuplicate.name,
        description: flatLogicFunctionToDuplicate.description ?? undefined,
        timeoutSeconds: flatLogicFunctionToDuplicate.timeoutSeconds,
        applicationId: flatLogicFunctionToDuplicate.applicationId ?? undefined,
        logicFunctionLayerId: flatLogicFunctionToDuplicate.logicFunctionLayerId,
      },
      workspaceId,
    );

    await this.fileStorageService.copy({
      from: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction: flatLogicFunctionToDuplicate,
          version,
        }),
      },
      to: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction: newFlatLogicFunction,
          version: 'draft',
        }),
      },
    });

    return newFlatLogicFunction;
  }

  private async throttleExecution(workspaceId: string) {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${workspaceId}-logic-function-execution`,
        1,
        this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_TTL'),
      );
    } catch {
      throw new LogicFunctionException(
        'Logic function execution rate limit exceeded',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED,
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
            new LogicFunctionException(
              `Execution timeout: ${timeoutMs / 1000}s`,
              LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_TIMEOUT,
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
