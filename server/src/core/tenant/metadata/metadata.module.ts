import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/core/tenant/datasource/datasource.module';

import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';

@Module({
  imports: [DataSourceModule],
  controllers: [MetadataController],
  providers: [MetadataService],
})
export class MetadataModule {}
