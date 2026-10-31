import { Module } from '@nestjs/common';
import { RoleAssignmentValidationService } from 'src/engine/permissions/role-assignment/services/role-assignment-validation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RoleAssignmentValidationService],
  exports: [RoleAssignmentValidationService],
})
export class RoleAssignmentValidationModule {}
