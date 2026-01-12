import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ADMIN_ROLE } from 'src/engine/metadata-modules/role/constants/admin-role';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

@Injectable()
export class WorkspaceManagerService {
  private readonly logger = new Logger(WorkspaceManagerService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly dataSourceService: DataSourceService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    private readonly applicationService: ApplicationService,
  ) {}

  public async init({
    workspace,
    userId,
  }: {
    workspace: WorkspaceEntity;
    userId: string;
  }): Promise<void> {
    const workspaceId = workspace.id;
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

    await this.dataSourceService.createDataSourceMetadata(
      workspaceId,
      schemaName,
    );

    await this.applicationService.createTwentyStandardApplication({
      workspaceId,
    });

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      {
        workspaceId,
      },
    );

    const dataSourceMetadataCreationEnd = performance.now();

    this.logger.log(
      `Metadata creation took ${dataSourceMetadataCreationEnd - dataSourceMetadataCreationStart}ms`,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.setupDefaultRoles({
      workspaceId,
      userId,
      workspaceCustomFlatApplication,
    });
  }

  /**
   * @deprecated Should be removed once AddWorkspaceForeignKeysMigrationCommand has been run successfully in production
   * As we will be able to rely on foreignKey delete cascading
   */
  public async delete(workspaceId: string): Promise<void> {
    await this.roleTargetRepository.delete({
      workspaceId,
    });
    await this.roleRepository.delete({
      workspaceId,
    });

    await this.serverlessFunctionRepository.delete({
      workspaceId,
    });

    await this.objectMetadataService.deleteWorkspaceAllObjectMetadata({
      workspaceId,
    });

    await this.dataSourceService.delete(workspaceId);
  }

  private async setupDefaultRoles({
    userId,
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    userId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<void> {
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

      await this.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId,
        userWorkspaceIds: [userWorkspace.id],
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
    });

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: memberRole.id,
    });
  }
}
