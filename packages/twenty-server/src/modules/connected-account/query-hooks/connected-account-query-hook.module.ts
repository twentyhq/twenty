import { Module } from '@nestjs/common';

import { ConnectedAccountDeleteOnePreQueryHook } from 'src/modules/connected-account/query-hooks/connected-account-delete-one.pre-query.hook';

@Module({
  imports: [],
  providers: [ConnectedAccountDeleteOnePreQueryHook],
})
export class ConnectedAccountQueryHookModule {}
