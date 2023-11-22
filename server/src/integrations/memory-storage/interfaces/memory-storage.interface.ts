import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { MemoryStorageType } from 'src/integrations/environment/interfaces/memory-storage.interface';
import { MemoryStorageSerializer } from 'src/integrations/memory-storage/serializers/interfaces/memory-storage-serializer.interface';

import { LocalMemoryDriverOptions } from 'src/integrations/memory-storage/drivers/local.driver';

export interface LocalMemoryDriverFactoryOptions {
  type: MemoryStorageType.Local;
  options: LocalMemoryDriverOptions;
}

interface MemoryStorageModuleBaseOptions {
  identifier: string;
  serializer?: MemoryStorageSerializer<any>;
}

export type MemoryStorageModuleOptions = MemoryStorageModuleBaseOptions &
  LocalMemoryDriverFactoryOptions;

export type MemoryStorageModuleAsyncOptions = {
  identifier: string;
  useFactory: (
    ...args: any[]
  ) =>
    | Omit<MemoryStorageModuleOptions, 'identifier'>
    | Promise<Omit<MemoryStorageModuleOptions, 'identifier'>>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
