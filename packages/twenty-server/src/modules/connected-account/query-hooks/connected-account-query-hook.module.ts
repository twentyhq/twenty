import { Module } from '@nestjs/common';

import { BlocklistCreateOnePreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-one.pre-query.hook';

@Module({
  imports: [],
  providers: [
    {
      provide: BlocklistCreateOnePreQueryHook.name,
      useClass: BlocklistCreateOnePreQueryHook,
    },
  ],
})
export class ConnectedAccountQueryHookModule {}
