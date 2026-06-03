import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ShahryarPublicController } from 'src/modules/shahryar/controllers/shahryar-public.controller';
import { ShahryarController } from 'src/modules/shahryar/controllers/shahryar.controller';
import { ShahryarNotificationDispatchCronCommand } from 'src/modules/shahryar/crons/commands/shahryar-notification-dispatch.cron.command';
import { ShahryarNotificationDispatchCronJob } from 'src/modules/shahryar/crons/jobs/shahryar-notification-dispatch.cron.job';
import { ShahryarAdminWorkspaceService } from 'src/modules/shahryar/services/shahryar-admin.workspace-service';
import { ShahryarBackupService } from 'src/modules/shahryar/services/shahryar-backup.service';
import { ShahryarMobileAuthService } from 'src/modules/shahryar/services/shahryar-mobile-auth.service';
import { ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';
import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';
import { ShahryarPhotoService } from 'src/modules/shahryar/services/shahryar-photo.service';
import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

@Module({
  imports: [
    AuthModule,
    FilesFieldModule,
    RoleModule,
    UserRoleModule,
    UserWorkspaceModule,
    WorkspaceDomainsModule,
    WorkspaceCacheStorageModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  controllers: [ShahryarController, ShahryarPublicController],
  providers: [
    ShahryarAdminWorkspaceService,
    ShahryarBackupService,
    ShahryarMobileAuthService,
    ShahryarReportService,
    ShahryarMobileSyncService,
    ShahryarNotificationDispatchCronCommand,
    ShahryarNotificationDispatchCronJob,
    ShahryarNotificationService,
    ShahryarPhotoService,
  ],
})
export class ShahryarModule {}
