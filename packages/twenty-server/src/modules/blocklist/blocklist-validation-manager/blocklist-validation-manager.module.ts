import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { BlocklistAuthorizationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-authorization.service';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';

@Module({
  imports: [PermissionsModule],
  providers: [
    BlocklistAuthorizationService,
    BlocklistRepository,
    BlocklistValidationService,
  ],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationManagerModule {}
