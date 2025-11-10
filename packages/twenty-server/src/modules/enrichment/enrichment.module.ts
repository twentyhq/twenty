import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

import { EnrichmentResolver } from './enrichment.resolver';

import { LinkupEnrichmentService } from './services/linkup-enrichment.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TwentyConfigModule,
    TwentyORMModule,
  ],
  providers: [LinkupEnrichmentService, EnrichmentResolver],
  exports: [LinkupEnrichmentService],
})
export class EnrichmentModule {}
