import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { prefillCoreViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-core-views';
import { standardObjectsPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Injectable()
export class WorkspaceManagerService {
  private readonly logger = new Logger(WorkspaceManagerService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly agentService: AgentService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async init({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<void> {
    const schemaCreationStart = performance.now();
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const schemaCreationEnd = performance.now();

    this.logger.log(
      `Schema creation took ${schemaCreationEnd - schemaCreationStart}ms`,
    );

    const dataSourceMetadataCreationStart = performance.now();
    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId,
      dataSourceId: dataSourceMetadata.id,
      featureFlags,
    });

    const dataSourceMetadataCreationEnd = performance.now();

    this.logger.log(
      `Metadata creation took ${dataSourceMetadataCreationEnd - dataSourceMetadataCreationStart}ms`,
    );

    await this.setupDefaultRoles(workspaceId, userId);

    if (featureFlags[FeatureFlagKey.IS_AI_ENABLED]) {
      const defaultAgentEnabledStart = performance.now();

      await this.initDefaultAgent(workspaceId);
      const defaultAgentEnabledEnd = performance.now();

      this.logger.log(
        `Default agent enabled took ${defaultAgentEnabledEnd - defaultAgentEnabledStart}ms`,
      );
    }

    const prefillStandardObjectsStart = performance.now();

    await this.prefillWorkspaceWithStandardObjectsRecords(
      dataSourceMetadata,
      workspaceId,
      featureFlags,
    );

    const prefillStandardObjectsEnd = performance.now();

    this.logger.log(
      `Prefill standard objects took ${prefillStandardObjectsEnd - prefillStandardObjectsStart}ms`,
    );
  }

  private async prefillWorkspaceWithStandardObjectsRecords(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    featureFlags: Record<string, boolean>,
  ) {
    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await standardObjectsPrefillData(
      this.coreDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
      featureFlags,
    );

    await prefillCoreViews({
      coreDataSource: this.coreDataSource,
      workspaceId,
      objectMetadataItems: createdObjectMetadata,
      schemaName: dataSourceMetadata.schema,
      featureFlags,
    });
  }

  public async delete(workspaceId: string): Promise<void> {
    //TODO: delete all logs when #611 closed
    this.logger.log(`Deleting workspace ${workspaceId} ...`);

    await this.fieldMetadataRepository.delete({
      workspaceId,
    });
    this.logger.log(`workspace ${workspaceId} field metadata deleted`);

    await this.roleTargetsRepository.delete({
      workspaceId,
    });
    this.logger.log(`workspace ${workspaceId} role targets deleted`);

    await this.roleRepository.delete({
      workspaceId,
    });
    this.logger.log(`workspace ${workspaceId} role deleted`);

    await this.objectMetadataService.deleteObjectsMetadata(workspaceId);
    this.logger.log(`workspace ${workspaceId} object metadata deleted`);

    await this.workspaceMigrationService.deleteAllWithinWorkspace(workspaceId);
    this.logger.log(`workspace ${workspaceId} migration deleted`);

    await this.dataSourceService.delete(workspaceId);
    this.logger.log(`workspace ${workspaceId} data source deleted`);
    // Delete schema
    await this.workspaceDataSourceService.deleteWorkspaceDBSchema(workspaceId);
    this.logger.log(`workspace ${workspaceId} schema deleted`);
  }

  private async initDefaultAgent(workspaceId: string) {
    const agent = await this.agentService.createOneAgent(
      {
        label: 'Routing Agent',
        name: 'routing-agent',
        description: 'Default Routing Agent',
        prompt: '',
        modelId: 'auto',
        isCustom: false,
      },
      workspaceId,
    );

    await this.workspaceRepository.update(workspaceId, {
      defaultAgentId: agent.id,
    });
  }

  private async setupDefaultRoles(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: {
        standardId: ADMIN_ROLE.standardId,
        workspaceId,
      },
    });

    if (adminRole) {
      const userWorkspace = await this.userWorkspaceRepository.findOneOrFail({
        where: { workspaceId, userId },
      });

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: userWorkspace.id,
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: memberRole.id,
    });
  }
}
