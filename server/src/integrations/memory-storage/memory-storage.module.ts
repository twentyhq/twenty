import { DynamicModule, Global } from '@nestjs/common';

import { MemoryStorageDefaultSerializer } from 'src/integrations/memory-storage/serializers/default.serializer';
import { createMemoryStorageInjectionToken } from 'src/integrations/memory-storage/memory-storage.util';

import {
  MemoryStorageDriverType,
  MemoryStorageModuleAsyncOptions,
  MemoryStorageModuleOptions,
} from './interfaces';

import { LocalMemoryDriver } from './drivers/local.driver';

@Global()
export class MemoryStorageModule {
  static forRoot(options: MemoryStorageModuleOptions): DynamicModule {
    // Dynamic injection token to allow multiple instances of the same driver
    const injectionToken = createMemoryStorageInjectionToken(
      options.identifier,
    );
    const provider = {
      provide: injectionToken,
      useValue: this.createStorageDriver(options),
    };

    return {
      module: MemoryStorageModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forRootAsync(options: MemoryStorageModuleAsyncOptions): DynamicModule {
    // Dynamic injection token to allow multiple instances of the same driver
    const injectionToken = createMemoryStorageInjectionToken(
      options.identifier,
    );
    const provider = {
      provide: injectionToken,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return this.createStorageDriver({
          identifier: options.identifier,
          ...config,
        });
      },
      inject: options.inject || [],
    };

    return {
      module: MemoryStorageModule,
      imports: options.imports || [],
      providers: [provider],
      exports: [provider],
    };
  }

  private static createStorageDriver(options: MemoryStorageModuleOptions) {
    switch (options.type) {
      case MemoryStorageDriverType.Local:
        return new LocalMemoryDriver(
          options.identifier,
          options.options,
          options.serializer ?? new MemoryStorageDefaultSerializer<string>(),
        );
      // Future case for Redis or other types
      default:
        throw new Error(`Unsupported storage type: ${options.type}`);
    }
  }
}
