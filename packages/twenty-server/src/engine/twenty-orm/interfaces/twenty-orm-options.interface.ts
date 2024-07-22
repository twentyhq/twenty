import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TwentyORMOptions {}

export type TwentyORMModuleAsyncOptions = {
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
