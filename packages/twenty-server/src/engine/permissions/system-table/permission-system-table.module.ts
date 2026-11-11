/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PermissionSystemTableService } from 'src/engine/permissions/system-table/services/permission-system-table.service';

@Module({
  providers: [PermissionSystemTableService],
  exports: [PermissionSystemTableService],
})
export class PermissionSystemTableModule {}
