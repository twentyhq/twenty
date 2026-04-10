import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { DeleteWorkspaceMemberConnectedAccountsCleanupJob } from 'src/modules/connected-account/jobs/delete-workspace-member-connected-accounts.job';
import { ConnectedAccountWorkspaceMemberListener } from 'src/modules/connected-account/listeners/connected-account-workspace-member.listener';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
    UserVarsModule,
  ],
  providers: [
    AccountsToReconnectService,
    ConnectedAccountListener,
    DeleteWorkspaceMemberConnectedAccountsCleanupJob,
    ConnectedAccountWorkspaceMemberListener,
  ],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
