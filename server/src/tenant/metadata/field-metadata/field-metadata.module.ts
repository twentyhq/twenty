import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataService } from './field-metadata.service';
import { FieldMetadata } from './field-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldMetadata], 'metadata')],
  providers: [FieldMetadataService],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
