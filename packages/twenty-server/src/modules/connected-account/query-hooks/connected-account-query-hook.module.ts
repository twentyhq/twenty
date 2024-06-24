import { Module } from '@nestjs/common';

import { BlocklistCreateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-one.pre-query.hook';
import { BlocklistValidationModule } from 'src/modules/connected-account/services/blocklist/blocklist-validation.module';

@Module({
  imports: [BlocklistValidationModule],
  providers: [
    BlocklistCreateManyPreQueryHook,
    BlocklistUpdateManyPreQueryHook,
    BlocklistUpdateOnePreQueryHook,
  ],
})
export class ConnectedAccountQueryHookModule {}
