import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

import { EnrichmentResolver } from './enrichment.resolver';

import { LinkupEnrichmentService } from './services/linkup-enrichment.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    TwentyORMModule,
  ],
  providers: [LinkupEnrichmentService, EnrichmentResolver],
  exports: [LinkupEnrichmentService],
})
export class EnrichmentModule {}
