import { Injectable, Logger } from '@nestjs/common';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { seedCoreSchema } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-core-schema.util';

@Injectable()
export class DevSeederService {
  private readonly logger = new Logger(DevSeederService.name);

  constructor(
    private readonly typeORMService: TypeORMService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly dataSourceService: DataSourceService,
  ) {}

  public async seedDev(workspaceId: string): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const mainDataSource = this.typeORMService.getMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    await this.createWorkspaceSchema(workspaceId);

    // const schemaName =
    //   await this.workspaceDataSourceService.createWorkspaceDBSchema(
    //     workspaceId,
    //   );

    // const dataSourceMetadata =
    //   await this.dataSourceService.createDataSourceMetadata(
    //     workspaceId,
    //     schemaName,
    //   );

    // const featureFlags =
    //   await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    // await this.workspaceSyncMetadataService.synchronize({
    //   workspaceId: workspaceId,
    //   dataSourceId: dataSourceMetadata.id,
    //   featureFlags,
    // });

    // await this.devSeederMetadataService.seedMetadata({
    //   dataSourceMetadata,
    //   workspaceId,
    // });

    // await this.devSeederPermissionsService.initPermissions(workspaceId);
  }

  public async createWorkspaceSchema(workspaceId: string) {
    await this.workspaceCacheStorageService.flush(workspaceId, undefined);

    await rawDataSource.initialize();

    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await seedCoreSchema({
      dataSource: rawDataSource,
      workspaceId,
      seedBilling: isBillingEnabled,
      appVersion,
    });

    await rawDataSource.destroy();

    // await this.workspaceManagerService.seedDev(workspaceId);
  }
}
