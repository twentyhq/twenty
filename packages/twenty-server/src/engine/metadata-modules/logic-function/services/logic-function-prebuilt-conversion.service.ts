import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionEligibleForPrebuiltConversion } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-eligible-for-prebuilt-conversion.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionPrebuiltConversionService {
  private readonly logger = new Logger(
    LogicFunctionPrebuiltConversionService.name,
  );

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async findApplicationIdsToConvert({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string[]> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    return Object.keys(
      flatLogicFunctionMaps.universalIdentifiersByApplicationId,
    ).filter(
      (applicationId) =>
        this.findLogicFunctionsToConvert({
          applicationId,
          flatLogicFunctionMaps,
          flatApplicationMaps,
        }).length > 0,
    );
  }

  async convertApplicationLogicFunctionsToPrebuilt({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<FlatLogicFunction[]> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const flatApplication = this.findConvertibleFlatApplication({
      applicationId,
      flatApplicationMaps,
    });

    if (!isDefined(flatApplication)) {
      this.logger.warn(
        `Skipping prebuilt conversion of application '${applicationId}' (workspace=${workspaceId}): application is missing or deleted`,
      );

      return [];
    }

    const flatLogicFunctionsToConvert = this.findLogicFunctionsToConvert({
      applicationId,
      flatLogicFunctionMaps,
      flatApplicationMaps,
    });

    if (flatLogicFunctionsToConvert.length === 0) {
      return [];
    }

    const updatedAt = new Date().toISOString();
    const convertedFlatLogicFunctions = flatLogicFunctionsToConvert.map(
      (flatLogicFunction) => ({
        ...flatLogicFunction,
        executionMode: LogicFunctionExecutionMode.PREBUILT,
        updatedAt,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: convertedFlatLogicFunctions,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while converting logic functions of application '${applicationId}' to prebuilt`,
      );
    }

    return convertedFlatLogicFunctions;
  }

  private findLogicFunctionsToConvert({
    applicationId,
    flatLogicFunctionMaps,
    flatApplicationMaps,
  }: {
    applicationId: string;
    flatLogicFunctionMaps: FlatLogicFunctionMaps;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): FlatLogicFunction[] {
    const flatApplication = this.findConvertibleFlatApplication({
      applicationId,
      flatApplicationMaps,
    });

    if (!isDefined(flatApplication)) {
      return [];
    }

    const universalIdentifiers =
      flatLogicFunctionMaps.universalIdentifiersByApplicationId[
        applicationId
      ] ?? [];

    return universalIdentifiers
      .map(
        (universalIdentifier) =>
          flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(
        (flatLogicFunction): flatLogicFunction is FlatLogicFunction =>
          isDefined(flatLogicFunction) &&
          isLogicFunctionEligibleForPrebuiltConversion({
            flatLogicFunction,
            applicationSourceType: flatApplication.sourceType,
          }),
      );
  }

  private findConvertibleFlatApplication({
    applicationId,
    flatApplicationMaps,
  }: {
    applicationId: string;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): FlatApplication | undefined {
    const flatApplication = flatApplicationMaps.byId[applicationId];

    if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
      return undefined;
    }

    return flatApplication;
  }
}
