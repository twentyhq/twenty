import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TypeORMService } from './typeorm.service';

import { typeORMMetadataModuleOptions } from './metadata/metadata.datasource';

const metadataTypeORMFactory = async (): Promise<TypeOrmModuleOptions> => ({
  ...typeORMMetadataModuleOptions,
  name: 'metadata',
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: metadataTypeORMFactory,
      name: 'metadata',
    }),
  ],
  providers: [TypeORMService],
  exports: [TypeORMService],
})
export class TypeORMModule {}
