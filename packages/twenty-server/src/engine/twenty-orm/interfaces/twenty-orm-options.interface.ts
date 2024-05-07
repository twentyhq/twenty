import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';

import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

export interface TwentyORMOptions {
  objects: Type<BaseObjectMetadata>[];
}

export type TwentyORMModuleAsyncOptions = {
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
