import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

 
export type TwentyORMOptions = Record<string, never>;

export type TwentyORMModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
