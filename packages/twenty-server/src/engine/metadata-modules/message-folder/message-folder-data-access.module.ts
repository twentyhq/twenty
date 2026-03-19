import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessageFolderDataAccessService } from 'src/engine/metadata-modules/message-folder/message-folder-data-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageFolderEntity]), FeatureFlagModule],
  providers: [MessageFolderDataAccessService],
  exports: [MessageFolderDataAccessService],
})
export class MessageFolderDataAccessModule {}
