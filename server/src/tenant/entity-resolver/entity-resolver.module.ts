import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { EntityResolverService } from './entity-resolver.service';

@Module({
  imports: [DataSourceModule],
  providers: [EntityResolverService],
  exports: [EntityResolverService],
})
export class EntityResolverModule {}
