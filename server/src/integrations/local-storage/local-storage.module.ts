import { Global, Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { ConfigurableModuleClass } from './local-storage.module-definition';

@Global()
@Module({
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class LocalStorageModule extends ConfigurableModuleClass {}
