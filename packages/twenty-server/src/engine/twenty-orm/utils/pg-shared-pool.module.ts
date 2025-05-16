import { Module, OnModuleInit } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PgPoolSharedService } from 'src/engine/twenty-orm/services/pg-shared-pool.service';

/**
 * Module that initializes the shared pg pool at application bootstrap
 */
@Module({
  imports: [TwentyConfigModule],
  providers: [PgPoolSharedService],
  exports: [PgPoolSharedService],
})
export class PgPoolSharedModule implements OnModuleInit {
  constructor(
    private readonly pgPoolSharedService: PgPoolSharedService,
    private readonly configService: TwentyConfigService,
  ) {
    // Initialize immediately in constructor for earliest possible patching
    this.pgPoolSharedService.initialize();
  }

  /**
   * Initialize again during module init as a safety measure
   */
  onModuleInit() {
    // The initialize method is idempotent so calling it twice is safe
    this.pgPoolSharedService.initialize();
  }
}
