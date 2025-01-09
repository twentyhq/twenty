import { Module } from '@nestjs/common';

import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { DeleteWorkspaceMemberConnectedAccountsCleanupJob } from 'src/modules/connected-account/jobs/delete-workspace-member-connected-accounts.job';
import { ConnectedAccountWorkspaceMemberListener } from 'src/modules/connected-account/listeners/connected-account-workspace-member.listener';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [UserVarsModule],
  providers: [
    AccountsToReconnectService,
    ConnectedAccountListener,
    DeleteWorkspaceMemberConnectedAccountsCleanupJob,
    ConnectedAccountWorkspaceMemberListener,
  ],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
