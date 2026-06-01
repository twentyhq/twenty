import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ShahryarController } from 'src/modules/shahryar/controllers/shahryar.controller';
import { ShahryarAdminWorkspaceService } from 'src/modules/shahryar/services/shahryar-admin.workspace-service';
import { ShahryarBackupService } from 'src/modules/shahryar/services/shahryar-backup.service';
import { ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';
import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';
import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

@Module({
  imports: [
    AuthModule,
    UserRoleModule,
    UserWorkspaceModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [ShahryarController],
  providers: [
    ShahryarAdminWorkspaceService,
    ShahryarBackupService,
    ShahryarReportService,
    ShahryarMobileSyncService,
    ShahryarNotificationService,
  ],
})
export class ShahryarModule {}
