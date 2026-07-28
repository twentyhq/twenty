import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountAuthFailureService } from 'src/modules/connected-account/services/connected-account-auth-failure.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
    UserVarsModule,
  ],
  providers: [
    AccountsToReconnectService,
    ConnectedAccountAuthFailureService,
    ConnectedAccountListener,
  ],
  exports: [AccountsToReconnectService, ConnectedAccountAuthFailureService],
})
export class ConnectedAccountModule {}
