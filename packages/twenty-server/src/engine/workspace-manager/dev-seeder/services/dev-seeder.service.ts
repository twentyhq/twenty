import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  type SeededWorkspacesIds,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { seedBillingCustomers } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-customers.util';
import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { seedApiKeys } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-api-keys.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedMetadataEntities } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-metadata-entities.util';
import { seedServerId } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-server-id.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { createWorkspace } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspace.util';
import { seedPageLayoutTabs } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layout-tabs.util';
import { seedPageLayoutWidgets } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layout-widgets.util';
import { seedPageLayouts } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layouts.util';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

@Injectable()
export class DevSeederService {
  private readonly logger = new Logger(DevSeederService.name);

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

    const lastWorkspaceCommand =
      this.upgradeSequenceReaderService.getLastWorkspaceCommand();

    await this.seedCoreSchema({
      workspaceId,
      seedBilling: isBillingEnabled,
      appVersion,
      lastUpgradeStepName: lastWorkspaceCommand.name,
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

    await seedPageLayouts(
      this.coreDataSource,
      'core',
      workspaceId,
      twentyStandardFlatApplication.id,
    );
    await seedPageLayoutTabs({
      applicationId: twentyStandardFlatApplication.id,
      workspaceId,
      dataSource: this.coreDataSource,
      schemaName: 'core',
    });

    const objectMetadataRepository =
      this.coreDataSource.getRepository(ObjectMetadataEntity);
    const objectMetadataItems = await objectMetadataRepository.find({
      where: { workspaceId },
      relations: { fields: true },
    });

    await seedPageLayoutWidgets({
      dataSource: this.coreDataSource,
      schemaName: 'core',
      workspaceId,
      objectMetadataItems,
      applicationId: twentyStandardFlatApplication.id,
    });

    const relatedPageLayoutCacheKeysToInvalidate = [
      ...getMetadataRelatedMetadataNames(ALL_METADATA_NAME.pageLayout),
      ...getMetadataRelatedMetadataNames(ALL_METADATA_NAME.pageLayoutTab),
      ...getMetadataRelatedMetadataNames(ALL_METADATA_NAME.pageLayoutWidget),
    ].map(getMetadataFlatEntityMapsKey);

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      relatedPageLayoutCacheKeysToInvalidate,
    );

    await this.devSeederDataService.seed({
      schemaName,
      workspaceId,
      featureFlags: featureFlagsMap,
      light,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }

  private async seedCoreSchema({
    workspaceId,
    appVersion,
    lastUpgradeStepName,
    seedBilling = true,
  }: {
    workspaceId: SeededWorkspacesIds;
    appVersion: string;
    lastUpgradeStepName: string;
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

      await this.upgradeMigrationService.markAsInitial({
        name: lastUpgradeStepName,
        workspaceId,
        executedByVersion: appVersion,
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
