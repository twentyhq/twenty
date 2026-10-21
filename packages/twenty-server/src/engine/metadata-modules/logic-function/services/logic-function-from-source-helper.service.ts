import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_SOURCE_HANDLER_PATH,
} from 'src/engine/metadata-modules/logic-function/constants/handler.contant';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionFromSourceHelperService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  async findLogicFunctionAndApplicationOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const [
      { flatLogicFunctionMaps, flatApplicationMaps },
      { workspaceCustomFlatApplication },
    ] = await Promise.all([
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
      }),
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
    ]);

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    const ownerFlatApplication =
      flatApplicationMaps.byId[flatLogicFunction.applicationId];

    if (!isDefined(ownerFlatApplication)) {
      throw new LogicFunctionException(
        `Application not found for logic function ${id}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    return {
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
    };
  }

  async findWorkspaceCustomLogicFunctionOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const {
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
    } = await this.findLogicFunctionAndApplicationOrThrow({ id, workspaceId });

    if (ownerFlatApplication.id !== workspaceCustomFlatApplication.id) {
      throw new LogicFunctionException(
        'Only logic functions written in this workspace can be read or changed from source',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_FORBIDDEN,
      );
    }

    return { flatLogicFunction, ownerFlatApplication };
  }

  async findLogicFunctionRunnableOnDemandOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const {
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
    } = await this.findLogicFunctionAndApplicationOrThrow({ id, workspaceId });

    const isRunnableOnDemand = await this.isRunnableOnDemand({
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
      workspaceId,
    });

    if (!isRunnableOnDemand) {
      throw new LogicFunctionException(
        'Only logic functions written in this workspace or exposed as workflow actions can be run on demand',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_FORBIDDEN,
      );
    }

    return { flatLogicFunction, ownerFlatApplication };
  }

  async isLogicFunctionRunnableOnDemand({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    const {
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
    } = await this.findLogicFunctionAndApplicationOrThrow({ id, workspaceId });

    return this.isRunnableOnDemand({
      flatLogicFunction,
      ownerFlatApplication,
      workspaceCustomFlatApplication,
      workspaceId,
    });
  }

  private async isRunnableOnDemand({
    flatLogicFunction,
    ownerFlatApplication,
    workspaceCustomFlatApplication,
    workspaceId,
  }: {
    flatLogicFunction: FlatLogicFunction;
    ownerFlatApplication: FlatApplication;
    workspaceCustomFlatApplication: FlatApplication;
    workspaceId: string;
  }): Promise<boolean> {
    if (
      ownerFlatApplication.id === workspaceCustomFlatApplication.id ||
      isDefined(flatLogicFunction.workflowActionTriggerSettings)
    ) {
      return true;
    }

    if (!isDefined(ownerFlatApplication.applicationRegistrationId)) {
      return false;
    }

    return this.applicationRegistrationRepository.exists({
      where: {
        id: ownerFlatApplication.applicationRegistrationId,
        ownerWorkspaceId: workspaceId,
      },
    });
  }

  buildHandlerPaths(logicFunctionId: string) {
    const logicFunctionSubfolder =
      getLogicFunctionSubfolderForFromSource(logicFunctionId);

    return {
      sourceHandlerPath: join(
        logicFunctionSubfolder,
        DEFAULT_SOURCE_HANDLER_PATH,
      ),
      builtHandlerPath: join(
        logicFunctionSubfolder,
        DEFAULT_BUILT_HANDLER_PATH,
      ),
    };
  }

  async createOneFromMetadata({
    universalFlatLogicFunctionToCreate,
    workspaceId,
  }: {
    universalFlatLogicFunctionToCreate: UniversalFlatLogicFunction & {
      id: string;
    };
    workspaceId: string;
  }): Promise<UniversalFlatLogicFunction & { id: string }> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [universalFlatLogicFunctionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            universalFlatLogicFunctionToCreate.applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating logic function',
      );
    }

    return universalFlatLogicFunctionToCreate;
  }

  async updateOneFromMetadata({
    flatLogicFunctionToUpdate,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunctionToUpdate: FlatLogicFunction;
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<FlatLogicFunction> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatLogicFunctionToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
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
      flatEntityId: flatLogicFunctionToUpdate.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }
}
