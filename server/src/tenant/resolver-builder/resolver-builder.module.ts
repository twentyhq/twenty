import { Module } from '@nestjs/common';

import { QueryRunnerModule } from 'src/tenant/query-runner/query-runner.module';

import { ResolverFactory } from './resolver.factory';

import { resolverBuilderFactories } from './factories/factories';

@Module({
  imports: [QueryRunnerModule],
  providers: [...resolverBuilderFactories, ResolverFactory],
  exports: [ResolverFactory],
})
export class ResolverBuilderModule {}
