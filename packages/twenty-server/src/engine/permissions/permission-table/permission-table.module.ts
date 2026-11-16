/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PermissionTableService } from 'src/engine/permissions/permission-table/services/permission-table.service';

@Module({
  providers: [PermissionTableService],
  exports: [PermissionTableService],
})
export class PermissionTableModule {}
