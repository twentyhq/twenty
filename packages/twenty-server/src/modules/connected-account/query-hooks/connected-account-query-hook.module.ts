import { Module } from '@nestjs/common';

import { BlocklistCreateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-many.pre-query.hook';

@Module({
  imports: [],
  providers: [
    {
      provide: BlocklistCreateManyPreQueryHook.name,
      useClass: BlocklistCreateManyPreQueryHook,
    },
  ],
})
export class ConnectedAccountQueryHookModule {}
