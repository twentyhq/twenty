import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

export interface TwentyORMOptions {
  [key: string]: unknown;
}

export type TwentyORMModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
