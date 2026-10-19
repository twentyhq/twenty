import { Module } from '@nestjs/common';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule, WorkspaceCacheModule],
  providers: [RoleValidationService],
  exports: [RoleValidationService],
})
export class RoleValidationModule {}
