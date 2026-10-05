import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { BlocklistAccessService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-access.service';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';

@Module({
  imports: [PermissionsModule],
  providers: [
    BlocklistAccessService,
    BlocklistRepository,
    BlocklistValidationService,
  ],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationManagerModule {}
