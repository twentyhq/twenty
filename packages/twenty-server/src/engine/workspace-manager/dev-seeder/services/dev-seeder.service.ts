import { Injectable, Logger } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { seedCoreSchema } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-core-schema.util';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Injectable()
export class DevSeederService {
  private readonly logger = new Logger(DevSeederService.name);

  constructor(
    private readonly typeORMService: TypeORMService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly devSeederMetadataService: DevSeederMetadataService,
    private readonly devSeederPermissionsService: DevSeederPermissionsService,
    private readonly devSeederDataService: DevSeederDataService,
  ) {}

  public async seedDev(workspaceId: string): Promise<void> {
    const mainDataSource = this.typeORMService.getMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await seedCoreSchema({
      dataSource: mainDataSource,
      workspaceId,
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

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId: workspaceId,
      dataSourceId: dataSourceMetadata.id,
      featureFlags,
    });

    await this.devSeederMetadataService.seed({
      dataSourceMetadata,
      workspaceId,
    });

    await this.devSeederPermissionsService.initPermissions(workspaceId);

    await this.devSeederDataService.seed({
      schemaName: dataSourceMetadata.schema,
      workspaceId,
    });

    await this.workspaceCacheStorageService.flush(workspaceId, undefined);
  }
}
