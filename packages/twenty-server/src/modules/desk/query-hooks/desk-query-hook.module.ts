import { Module } from '@nestjs/common';

import { DeskUpdateOnePreQueryHook } from 'src/modules/desk/query-hooks/desk-update-one.pre-query.hook';

@Module({
  providers: [DeskUpdateOnePreQueryHook],
})
export class DeskQueryHookModule {}
