/* @license Enterprise */

import { Module } from '@nestjs/common';

import { RecordPermissionOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-orm.service';

@Module({
  providers: [RecordPermissionOrmService],
  exports: [RecordPermissionOrmService],
})
export class RecordPermissionOrmModule {}
