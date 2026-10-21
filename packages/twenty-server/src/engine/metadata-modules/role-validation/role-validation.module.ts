import { Module } from '@nestjs/common';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RoleValidationService],
  exports: [RoleValidationService],
})
export class RoleValidationModule {}
