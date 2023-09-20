import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { UnivervalService } from './universal.service';
import { CustomResolver } from './universal.resolver';

@Module({
  imports: [DataSourceModule],
  providers: [UnivervalService, CustomResolver],
})
export class UniversalModule {}
