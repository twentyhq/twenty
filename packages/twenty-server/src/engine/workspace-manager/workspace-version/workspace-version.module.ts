import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity])],
  providers: [WorkspaceVersionService],
  exports: [WorkspaceVersionService],
})
export class WorkspaceVersionModule {}
