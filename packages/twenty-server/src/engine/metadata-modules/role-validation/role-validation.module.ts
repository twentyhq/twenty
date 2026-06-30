import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [
    RoleValidationService,
    provideWorkspaceScopedRepository(RoleEntity),
  ],
  exports: [RoleValidationService],
})
export class RoleValidationModule {}
