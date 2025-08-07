import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { CustomersResolver } from './customers.resolver';
import { CustomersService } from './customers.service';

@Module({
  imports: [
    TwentyORMModule,
    TokenModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [
    CustomersService,
    CustomersResolver,
  ],
  exports: [
    CustomersService,
  ],
})
export class CustomersModule {}
