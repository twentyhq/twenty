import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { SeededWorkspacesIds } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedCoreSchema } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-core-schema.util';
import { seedPageLayoutTabs } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layout-tabs.util';
import { seedPageLayoutWidgets } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layout-widgets.util';
import { seedPageLayouts } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layouts.util';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class DevSeederService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly devSeederMetadataService: DevSeederMetadataService,
    private readonly devSeederPermissionsService: DevSeederPermissionsService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly devSeederDataService: DevSeederDataService,
    private readonly applicationService: ApplicationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async seedDev(workspaceId: SeededWorkspacesIds): Promise<void> {
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

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const twentyStandardApplication =
      await this.applicationService.findByUniversalIdentifier({
        workspaceId,
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      });

    if (!isDefined(twentyStandardApplication)) {
      throw new Error(
        'Seeder failed to find twenty standard application, should never occur',
      );
    }

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId: workspaceId,
      dataSourceId: dataSourceMetadata.id,
      featureFlags,
      twentyStandardApplication,
    });

    await this.devSeederMetadataService.seed({
      dataSourceMetadata,
      workspaceId,
      featureFlags,
    });

    await this.devSeederMetadataService.seedRelations({
      workspaceId,
    });

    await this.devSeederPermissionsService.initPermissions(workspaceId);

    await seedPageLayouts(this.coreDataSource, 'core', workspaceId);
    await seedPageLayoutTabs(this.coreDataSource, 'core', workspaceId);

    const objectMetadataRepository =
      this.coreDataSource.getRepository(ObjectMetadataEntity);
    const objectMetadataItems = await objectMetadataRepository.find({
      where: { workspaceId },
      relations: { fields: true },
    });

    const isDashboardV2Enabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
      workspaceId,
    );

    await seedPageLayoutWidgets({
      dataSource: this.coreDataSource,
      schemaName: 'core',
      workspaceId,
      objectMetadataItems,
      isDashboardV2Enabled,
    });

    await this.devSeederDataService.seed({
      schemaName: dataSourceMetadata.schema,
      workspaceId,
      featureFlags,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
    await this.flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId,
    });
  }
}
