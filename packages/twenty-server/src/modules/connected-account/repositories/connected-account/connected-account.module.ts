import { Module } from '@nestjs/common';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account/connected-account.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [ConnectedAccountRepository],
  exports: [ConnectedAccountRepository],
})
export class ConnectedAccountModule {}
