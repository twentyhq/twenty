import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { UniversalService } from './universal.service';
import { UniversalResolver } from './universal.resolver';

@Module({
  imports: [DataSourceModule],
  providers: [UniversalService, UniversalResolver],
})
export class UniversalModule {}
