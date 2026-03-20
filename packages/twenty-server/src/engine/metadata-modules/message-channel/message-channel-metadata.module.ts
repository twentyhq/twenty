import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { MessageChannelResolver } from 'src/engine/metadata-modules/message-channel/resolvers/message-channel.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    AuthModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  providers: [
    MessageChannelMetadataService,
    MessageChannelResolver,
    MessageChannelGraphqlApiExceptionInterceptor,
  ],
  exports: [MessageChannelMetadataService],
})
export class MessageChannelMetadataModule {}
