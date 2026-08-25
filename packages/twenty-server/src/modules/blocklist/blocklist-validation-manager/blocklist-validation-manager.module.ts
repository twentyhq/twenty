import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    PermissionsModule,
  ],
  providers: [BlocklistValidationService],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationManagerModule {}
