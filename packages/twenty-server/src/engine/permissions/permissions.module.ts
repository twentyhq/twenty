import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessGroupPropagationProgressReadService } from 'src/engine/permissions/access-group-propagation-progress-read.service';
import { AccessGroupReadModule } from 'src/engine/permissions/internal/access-group/access-group-read.module';
import { AccessGroupComputationModule } from 'src/engine/permissions/internal/access-group/access-group-computation.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationGrantRoleLookupModule } from 'src/engine/core-modules/application/application-grant-role-lookup/application-grant-role-lookup.module';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { RecordAccessGroupWriteService } from 'src/engine/permissions/record-access-group-write.service';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { RecordSharingReadService } from 'src/engine/permissions/record-share/services/record-sharing-read.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RelatedRecordPathReadModule } from 'src/engine/permissions/internal/related-record-path/related-record-path-read.module';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AccessGroupComputationModule,
    AccessGroupReadModule,
    ApplicationGrantRoleLookupModule,
    CoreEntityCacheModule,
    TypeOrmModule.forFeature([RoleTargetEntity]),
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
    RelatedRecordPathReadModule,
  ],
  providers: [
    AccessGroupPropagationProgressReadService,
    SettingPermissionsService,
    PermissionsMetadataMapsService,
    PrincipalPermissionsReadService,
    RecordAccessGroupWriteService,
    RecordEventPermissionsReadService,
    RecordFieldPermissionsReadService,
    RecordPermissionsReadService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [
    AccessGroupPropagationProgressReadService,
    PrincipalPermissionsReadService,
    RecordAccessGroupWriteService,
    RecordEventPermissionsReadService,
    RecordFieldPermissionsReadService,
    RecordPermissionsReadService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    SettingPermissionsService,
  ],
})
export class PermissionsModule {}
