import { Module } from '@nestjs/common';

import { MorphResolverService } from './morph-resolver.service';

@Module({
  providers: [MorphResolverService],
  exports: [MorphResolverService],
})
export class MorphResolverModule {}
