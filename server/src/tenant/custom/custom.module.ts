import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { CustomService } from './custom.service';
import { CustomResolver } from './custom.resolver';

@Module({
  imports: [DataSourceModule],
  providers: [CustomService, CustomResolver],
})
export class CustomModule {}
