import { DynamicModule, Global, Module } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  TwentyORMModuleAsyncOptions,
  TwentyORMOptions,
} from 'src/engine/twenty-orm/interfaces/twenty-orm-options.interface';

import { createTwentyORMProviders } from 'src/engine/twenty-orm/twenty-orm.providers';
import { TwentyORMCoreModule } from 'src/engine/twenty-orm/twenty-orm-core.module';

@Global()
@Module({})
export class TwentyORMModule {
  static register(options: TwentyORMOptions): DynamicModule {
    return {
      module: TwentyORMModule,
      imports: [TwentyORMCoreModule.register(options)],
    };
  }

  static forFeature(objects: EntityClassOrSchema[] = []): DynamicModule {
    const providers = createTwentyORMProviders(objects);

    return {
      module: TwentyORMModule,
      providers: providers,
      exports: providers,
    };
  }

  static registerAsync(
    asyncOptions: TwentyORMModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: TwentyORMModule,
      imports: [TwentyORMCoreModule.registerAsync(asyncOptions)],
    };
  }
}
