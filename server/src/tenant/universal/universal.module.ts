import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { UniversalResolver } from './universal.resolver';

@Module({
  imports: [DataSourceModule],
  providers: [UniversalResolver],
})
export class UniversalModule {}
