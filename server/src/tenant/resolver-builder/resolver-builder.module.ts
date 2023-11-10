import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { ResolverFactory } from './resolver.factory';

import { resolverBuilderFactories } from './factories/factories';

@Module({
  imports: [DataSourceModule],
  providers: [...resolverBuilderFactories, ResolverFactory],
  exports: [ResolverFactory],
})
export class ResolverBuilderModule {}
