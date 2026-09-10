import { Module } from '@nestjs/common';

import { BlocklistValidationManagerModule } from 'src/modules/blocklist/blocklist-validation-manager/blocklist-validation-manager.module';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistCreateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-one.pre-query.hook';
import { BlocklistDeleteManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-delete-many.pre-query.hook';
import { BlocklistDeleteOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-delete-one.pre-query.hook';
import { BlocklistDestroyManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-destroy-many.pre-query.hook';
import { BlocklistDestroyOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-destroy-one.pre-query.hook';
import { BlocklistMergeManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-merge-many.pre-query.hook';
import { BlocklistRestoreManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-restore-many.pre-query.hook';
import { BlocklistRestoreOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-restore-one.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

@Module({
  imports: [BlocklistValidationManagerModule],
  providers: [
    BlocklistCreateManyPreQueryHook,
    BlocklistCreateOnePreQueryHook,
    BlocklistDeleteManyPreQueryHook,
    BlocklistDeleteOnePreQueryHook,
    BlocklistDestroyManyPreQueryHook,
    BlocklistDestroyOnePreQueryHook,
    BlocklistMergeManyPreQueryHook,
    BlocklistRestoreManyPreQueryHook,
    BlocklistRestoreOnePreQueryHook,
    BlocklistUpdateManyPreQueryHook,
    BlocklistUpdateOnePreQueryHook,
  ],
})
export class BlocklistQueryHookModule {}
