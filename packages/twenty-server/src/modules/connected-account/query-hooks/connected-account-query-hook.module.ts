import { Module } from '@nestjs/common';

import { BlocklistCreateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-many.pre-query.hook';
import { BlocklistValidationModule } from 'src/modules/connected-account/services/blocklist/blocklist-validation.module';

@Module({
  imports: [BlocklistValidationModule],
  providers: [
    {
      provide: BlocklistCreateManyPreQueryHook.name,
      useClass: BlocklistCreateManyPreQueryHook,
    },
  ],
})
export class ConnectedAccountQueryHookModule {}
