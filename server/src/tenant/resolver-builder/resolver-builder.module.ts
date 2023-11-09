import { Module } from '@nestjs/common';

import { TenantDataSourceModule } from 'src/tenant-datasource/tenant-datasource.module';

import { ResolverFactory } from './resolver.factory';

import { resolverBuilderFactories } from './factories/factories';

@Module({
  imports: [TenantDataSourceModule],
  providers: [...resolverBuilderFactories, ResolverFactory],
  exports: [ResolverFactory],
})
export class ResolverBuilderModule {}
