import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceCacheVersionEntity } from 'src/metadata/workspace-cache-version/workspace-cache-version.entity';
import { WorkspaceCacheVersionService } from 'src/metadata/workspace-cache-version/workspace-cache-version.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceCacheVersionEntity], 'metadata'),
  ],
  exports: [WorkspaceCacheVersionService],
  providers: [WorkspaceCacheVersionService],
})
export class WorkspaceCacheVersionModule {}
