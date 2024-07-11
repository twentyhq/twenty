import { Module } from '@nestjs/common';

import { BlocklistValidationModule } from 'src/modules/blocklist/blocklist-validation.module';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

@Module({
  imports: [BlocklistValidationModule],
  providers: [
    BlocklistCreateManyPreQueryHook,
    BlocklistUpdateManyPreQueryHook,
    BlocklistUpdateOnePreQueryHook,
  ],
})
export class BlocklistQueryHookModule {}
