import { StorageType } from 'src/integrations/environment/interfaces/storage.interface';
import { S3DriverOptions } from '../drivers/s3.driver';
import { LocalDriverOptions } from '../drivers/local.driver';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface S3DriverFactoryOptions {
  type: StorageType.S3;
  options: S3DriverOptions;
}

export interface LocalDriverFactoryOptions {
  type: StorageType.Local;
  options: LocalDriverOptions;
}

export type FileStorageModuleOptions =
  | S3DriverFactoryOptions
  | LocalDriverFactoryOptions;

export type FileStorageModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => FileStorageModuleOptions | Promise<FileStorageModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
