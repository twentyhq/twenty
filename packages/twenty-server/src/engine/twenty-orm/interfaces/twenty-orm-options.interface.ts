import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TwentyORMOptions {}

export type TwentyORMModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
