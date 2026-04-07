import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { SeededWorkspacesIds } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedCoreSchema } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-core-schema.util';
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
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async seedDev(
    workspaceId: SeededWorkspacesIds,
    options?: { light?: boolean },
  ): Promise<void> {
    const light = options?.light ?? false;
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await seedCoreSchema({
      dataSource: this.coreDataSource,
      workspaceId,
      applicationService: this.applicationService,
      seedBilling: isBillingEnabled,
      appVersion,
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

    await this.sdkClientGenerationService.generateSdkClientForApplication({
      workspaceId,
      applicationId: twentyStandardFlatApplication.id,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    await this.devSeederMetadataService.seed({
      dataSourceMetadata,
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
      schemaName: dataSourceMetadata.schema,
      workspaceId,
      featureFlags: featureFlagsMap,
      light,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }
}
