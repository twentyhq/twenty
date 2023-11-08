import { Module } from '@nestjs/common';

import { QueryBuilderFactory } from './query-builder.factory';

import { queryBuilderFactories } from './factories/factories';

@Module({
  imports: [],
  providers: [...queryBuilderFactories, QueryBuilderFactory],
  exports: [QueryBuilderFactory],
})
export class QueryBuilderModule {}
