import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataService } from './object-metadata.service';
import { ObjectMetadata } from './object-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectMetadata], 'metadata')],
  providers: [ObjectMetadataService],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
