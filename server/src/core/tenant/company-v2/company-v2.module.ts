import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/core/tenant/datasource/datasource.module';

import { CompanyV2Service } from './company-v2.service';
import { CompanyV2Resolver } from './company-v2.resolver';

@Module({
  imports: [DataSourceModule],
  providers: [CompanyV2Service, CompanyV2Resolver],
  exports: [CompanyV2Service],
})
export class CompanyV2Module {}
