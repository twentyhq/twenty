import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { seedBillingCustomers } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-customers.util';
import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import {
  type SeededEmptyWorkspacesIds,
  type SeededWorkspacesIds,
  SEEDER_CREATE_EMPTY_WORKSPACE_INPUT,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { seedApiKeys } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-api-keys.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedMetadataEntities } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-metadata-entities.util';
import { seedPageLayouts } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layouts.util';
import { seedServerId } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-server-id.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { createWorkspace } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspace.util';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { PrefillFrontComponentService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-front-component.service';
import { PrefillLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-logic-function.service';
import { getSeedFrontComponentDefinitions } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-front-component-definitions.util';
import { getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionDefinitions } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-code-step-logic-functions.util';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class DevSeederService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
    private readonly devSeederMetadataService: DevSeederMetadataService,
    private readonly devSeederPermissionsService: DevSeederPermissionsService,
    private readonly devSeederDataService: DevSeederDataService,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly prefillFrontComponentService: PrefillFrontComponentService,
    private readonly prefillLogicFunctionService: PrefillLogicFunctionService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  public async seedDev(
    workspaceId: SeededWorkspacesIds,
    options?: { light?: boolean },
  ): Promise<void> {
    const light = options?.light ?? false;
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const appVersion = this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const lastAttemptedInstanceCommand =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommandOrThrow();
    const initialCursor =
      this.upgradeSequenceReaderService.getInitialCursorForNewWorkspace(
        lastAttemptedInstanceCommand,
      );

    await this.seedCoreSchema({
      workspaceId,
      seedBilling: isBillingEnabled,
      appVersion,
      initialCursor,
    });

    await this.applicationRegistrationService.createCliRegistrationIfNotExists();

    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatApplicationMaps', 'featureFlagsMap'],
    );

    await this.workspaceRepository.update(workspaceId, {
      databaseSchema: schemaName,
    });

    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      {
        workspaceId,
      },
    );

    await this.sdkClientGenerationService.generateSdkClientForApplication({
      workspaceId,
      applicationId: twentyStandardFlatApplication.id,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    await this.devSeederMetadataService.seed({
      workspaceId,
      light,
    });

    await this.sdkClientGenerationService.generateSdkClientForApplication({
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    await this.devSeederMetadataService.seedRelations({
      workspaceId,
      light,
    });

    await this.devSeederPermissionsService.initPermissions({
      workspaceId,
      twentyStandardFlatApplication,
      workspaceCustomFlatApplication,
      light,
    });

    const objectMetadataRepository =
      this.coreDataSource.getRepository(ObjectMetadataEntity);
    const objectMetadataItems = await objectMetadataRepository.find({
      where: { workspaceId },
      relations: { fields: true },
    });

    await this.prefillLogicFunctionService.ensureSeeded({
      workspaceId,
      definitions:
        getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionDefinitions(
          workspaceId,
        ),
    });

    await this.prefillFrontComponentService.ensureSeeded({
      workspaceId,
      definitions: getSeedFrontComponentDefinitions(workspaceId),
    });

    await seedPageLayouts({
      workspaceId,
      flatApplication: twentyStandardFlatApplication,
      objectMetadataItems,
      workspaceMigrationValidateBuildAndRunService:
        this.workspaceMigrationValidateBuildAndRunService,
    });

    await this.devSeederDataService.seed({
      schemaName,
      workspaceId,
      featureFlags: featureFlagsMap,
      light,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }

  public async seedEmptyWorkspace(
    workspaceId: SeededEmptyWorkspacesIds,
  ): Promise<void> {
    const appVersion = this.twentyConfigService.get('APP_VERSION') ?? 'unknown';
    const lastAttemptedInstanceCommand =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommandOrThrow();
    const initialCursor =
      this.upgradeSequenceReaderService.getInitialCursorForNewWorkspace(
        lastAttemptedInstanceCommand,
      );

    const createWorkspaceStaticInput =
      SEEDER_CREATE_EMPTY_WORKSPACE_INPUT[workspaceId];
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspaceCustomApplicationId = v4();

      await createWorkspace({
        queryRunner,
        schemaName: 'core',
        createWorkspaceInput: {
          ...createWorkspaceStaticInput,
          workspaceCustomApplicationId,
        },
      });

      await this.applicationService.createWorkspaceCustomApplication(
        {
          workspaceId,
          applicationId: workspaceCustomApplicationId,
        },
        queryRunner,
      );

      await this.applicationService.createTwentyStandardApplication(
        {
          workspaceId,
          skipCacheInvalidation: true,
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.devSeederPermissionsService.initMinimalPermissionsAndActivateWorkspace(
      {
        workspaceId,
        workspaceCustomFlatApplication,
      },
    );

    await this.upgradeMigrationService.markAsWorkspaceInitial({
      name: initialCursor.name,
      workspaceId,
      executedByVersion: appVersion,
      status: initialCursor.status,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }

  private async seedCoreSchema({
    workspaceId,
    appVersion,
    initialCursor,
    seedBilling = true,
  }: {
    workspaceId: SeededWorkspacesIds;
    appVersion: string;
    initialCursor: { name: string; status: UpgradeMigrationStatus };
    seedBilling?: boolean;
  }): Promise<void> {
    const schemaName = 'core';
    const createWorkspaceStaticInput =
      SEEDER_CREATE_WORKSPACE_INPUT[workspaceId];
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspaceCustomApplicationId = v4();

      await createWorkspace({
        queryRunner,
        schemaName,
        createWorkspaceInput: {
          ...createWorkspaceStaticInput,
          workspaceCustomApplicationId,
        },
      });

      await this.applicationService.createWorkspaceCustomApplication(
        {
          workspaceId,
          applicationId: workspaceCustomApplicationId,
        },
        queryRunner,
      );

      await seedServerId({ queryRunner, schemaName });
      await seedUsers({ queryRunner, schemaName });
      await seedUserWorkspaces({ queryRunner, schemaName, workspaceId });

      await this.applicationService.createTwentyStandardApplication(
        {
          workspaceId,
          skipCacheInvalidation: true,
        },
        queryRunner,
      );

      await seedAgents({ queryRunner, schemaName, workspaceId });
      await seedApiKeys({ queryRunner, schemaName, workspaceId });
      await seedFeatureFlags({ queryRunner, schemaName, workspaceId });

      if (seedBilling) {
        await seedBillingCustomers({ queryRunner, schemaName, workspaceId });
        await seedBillingSubscriptions({
          queryRunner,
          schemaName,
          workspaceId,
        });
      }

      await seedMetadataEntities({ queryRunner, schemaName, workspaceId });

      await this.upgradeMigrationService.markAsWorkspaceInitial({
        name: initialCursor.name,
        workspaceId,
        executedByVersion: appVersion,
        status: initialCursor.status,
        queryRunner,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
