import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserWorkspaceEntity]), UserVarsModule],
  providers: [AccountsToReconnectService, ConnectedAccountListener],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
