import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { MorphResolverService } from './morph-resolver.service';

@Module({
  imports: [DataSourceModule],
  providers: [MorphResolverService],
  exports: [MorphResolverService],
})
export class MorphResolverModule {}
