import { Module } from '@nestjs/common';

import { PersonCreateManyTestSavePreQueryHook } from 'src/modules/person/query-hooks/person-create-many-test-save.pre-query.hook';

@Module({
  providers: [PersonCreateManyTestSavePreQueryHook],
})
export class PersonQueryHookModule {}
