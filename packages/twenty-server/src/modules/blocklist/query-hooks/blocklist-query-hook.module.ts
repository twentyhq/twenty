import { Module } from '@nestjs/common';

import { BlocklistValidationManagerModule } from 'src/modules/blocklist/blocklist-validation-manager/blocklist-validation-manager.module';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

@Module({
  imports: [BlocklistValidationManagerModule],
  providers: [
    BlocklistCreateManyPreQueryHook,
    BlocklistUpdateManyPreQueryHook,
    BlocklistUpdateOnePreQueryHook,
  ],
})
export class BlocklistQueryHookModule {}
