import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  APP_SEEDS,
  type AppSeedDefinition,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/app-seeds.constant';
import { SeededWorkspacesIds } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedCoreSchema } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-core-schema.util';
import { seedFrontComponentsAndCommandMenuItems } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-front-components-and-command-menu-items.util';
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
    private readonly dataSourceService: DataSourceService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
    private readonly devSeederMetadataService: DevSeederMetadataService,
    private readonly devSeederPermissionsService: DevSeederPermissionsService,
    private readonly devSeederDataService: DevSeederDataService,
    private readonly applicationService: ApplicationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async seedDev(
    workspaceId: SeededWorkspacesIds,
    options: { includeApps?: boolean } = {},
  ): Promise<void> {
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await seedCoreSchema({
      dataSource: this.coreDataSource,
      workspaceId,
      applicationService: this.applicationService,
      seedBilling: isBillingEnabled,
      appVersion,
    });

    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatApplicationMaps', 'featureFlagsMap'],
    );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

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

    if (options.includeApps) {
      await this.seedApps(workspaceId);
    }

    await this.devSeederMetadataService.seed({
      dataSourceMetadata,
      workspaceId,
    });

    await this.devSeederMetadataService.seedRelations({
      workspaceId,
    });

    await this.devSeederPermissionsService.initPermissions({
      workspaceId,
      twentyStandardFlatApplication,
      workspaceCustomFlatApplication,
    });

    await seedPageLayouts(
      this.coreDataSource,
      'core',
      workspaceId,
      workspaceCustomFlatApplication.id,
    );
    await seedPageLayoutTabs({
      applicationId: workspaceCustomFlatApplication.id,
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

    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    await seedPageLayoutWidgets({
      dataSource: this.coreDataSource,
      schemaName: 'core',
      workspaceId,
      objectMetadataItems,
      isDashboardV2Enabled,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
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
      schemaName: dataSourceMetadata.schema,
      workspaceId,
      featureFlags: featureFlagsMap,
    });

    await seedFrontComponentsAndCommandMenuItems({
      dataSource: this.coreDataSource,
      schemaName: 'core',
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
    });

    const relatedCommandMenuItemAndFrontComponentCacheKeysToInvalidate = [
      ...getMetadataRelatedMetadataNames(ALL_METADATA_NAME.commandMenuItem),
      ...getMetadataRelatedMetadataNames(ALL_METADATA_NAME.frontComponent),
    ].map(getMetadataFlatEntityMapsKey);

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      relatedCommandMenuItemAndFrontComponentCacheKeysToInvalidate,
    );

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }

  private async seedApps(workspaceId: string): Promise<void> {
    for (const seed of APP_SEEDS) {
      try {
        await this.seedOneApp(seed, workspaceId);
      } catch (error) {
        this.logger.error(
          `Failed to seed app "${seed.registration.name}": ${error}`,
        );
      }
    }
  }

  private async seedOneApp(
    seed: AppSeedDefinition,
    workspaceId: string,
  ): Promise<void> {
    let registration = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier: seed.registration.universalIdentifier,
      },
    });

    if (!registration) {
      registration = await this.appRegistrationRepository.save(
        this.appRegistrationRepository.create({
          universalIdentifier: seed.registration.universalIdentifier,
          name: seed.registration.name,
          description: seed.registration.description,
          sourceType: seed.registration.sourceType,
          sourcePackage: seed.registration.sourcePackage,
          author: seed.registration.author,
          oAuthClientId: `20202020-seed-${seed.registration.universalIdentifier.slice(0, 8)}`,
          oAuthClientSecretHash: 'seed',
          oAuthRedirectUris: [],
          oAuthScopes: [],
          ownerWorkspaceId: workspaceId,
          createdByUserId: null,
        }),
      );
    }

    await this.applicationInstallService.installFromFixtureDirectory({
      appRegistrationId: registration.id,
      fixtureDir: seed.fixtureDir,
      workspaceId,
    });

    this.logger.log(
      `Seeded app "${seed.registration.name}" (${seed.registration.sourceType})`,
    );
  }
}
