import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessageFolderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-folder/interceptors/message-folder-graphql-api-exception.interceptor';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';
import { MessageFolderResolver } from 'src/engine/metadata-modules/message-folder/resolvers/message-folder.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageFolderEntity]),
    AuthModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  providers: [
    MessageFolderMetadataService,
    MessageFolderResolver,
    MessageFolderGraphqlApiExceptionInterceptor,
  ],
  exports: [MessageFolderMetadataService],
})
export class MessageFolderMetadataModule {}
