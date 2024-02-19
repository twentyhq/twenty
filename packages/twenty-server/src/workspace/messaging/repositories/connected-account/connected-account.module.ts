import { Module } from '@nestjs/common';

import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [ConnectedAccountService],
  exports: [ConnectedAccountService],
})
export class ConnectedAccountModule {}
