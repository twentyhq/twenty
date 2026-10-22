import { Module } from '@nestjs/common';
import { RoleAssignmentValidationService } from 'src/engine/metadata-modules/role-assignment-validation/services/role-assignment-validation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RoleAssignmentValidationService],
  exports: [RoleAssignmentValidationService],
})
export class RoleAssignmentValidationModule {}
