import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { DEV_SEED_USER_WORKSPACE_IDS } from 'src/database/typeorm-seeds/core/user-workspaces';
import {
  SEED_ACME_WORKSPACE_ID,
  SEED_APPLE_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Injectable()
export class WorkspaceManagerService {
  private readonly logger = new Logger(WorkspaceManagerService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  public async seedDev(workspaceId: string): Promise<void> {
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

    await this.seedWorkspaceWithCustomObjects(dataSourceMetadata, workspaceId);
    await this.initPermissionsDev(workspaceId);
  }

  private async initPermissionsDev(workspaceId: string) {
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
      adminUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.TIM;
      memberUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.JONY;

      // Create guest role only in this workspace
      const guestRole = await this.roleService.createGuestRole({
        workspaceId,
      });

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: DEV_SEED_USER_WORKSPACE_IDS.PHIL,
        roleId: guestRole.id,
      });
    } else if (workspaceId === SEED_ACME_WORKSPACE_ID) {
      adminUserWorkspaceId = DEV_SEED_USER_WORKSPACE_IDS.TIM_ACME;
    }

    if (adminUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: adminUserWorkspaceId,
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: memberRole.id,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });

    if (memberUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: memberUserWorkspaceId,
        roleId: memberRole.id,
      });
    }
  }
}
