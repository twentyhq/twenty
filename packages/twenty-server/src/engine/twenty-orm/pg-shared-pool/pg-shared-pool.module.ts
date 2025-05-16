import {
  Global,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { PgPoolSharedService } from 'src/engine/twenty-orm/pg-shared-pool/pg-shared-pool.service';

/**
 * Module that initializes the shared pg pool at application bootstrap
 */
@Global()
@Module({
  imports: [TwentyConfigModule],
  providers: [PgPoolSharedService],
  exports: [PgPoolSharedService],
})
export class PgPoolSharedModule implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly pgPoolSharedService: PgPoolSharedService) {}

  /**
   * Initialize the pool sharing service when the module is initialized
   */
  onModuleInit() {
    this.pgPoolSharedService.initialize();
  }

  /**
   * Clean up any resources when the application shuts down
   */
  onApplicationShutdown() {
    this.pgPoolSharedService.onApplicationShutdown();
  }
}
