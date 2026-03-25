import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [RoleValidationService],
  exports: [RoleValidationService],
})
export class RoleValidationModule {}
