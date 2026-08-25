import { Module } from '@nestjs/common';

import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';

@Module({
  imports: [],
  providers: [BlocklistRepository, BlocklistValidationService],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationManagerModule {}
