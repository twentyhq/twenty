import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export interface TwentyORMOptions {
  workspaceEntities: (Type<BaseWorkspaceEntity> | string)[];
}

export type TwentyORMModuleAsyncOptions = {
  useFactory: (...args: any[]) => TwentyORMOptions | Promise<TwentyORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
