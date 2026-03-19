import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';
import { CalendarChannelResolver } from 'src/engine/metadata-modules/calendar-channel/resolvers/calendar-channel.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarChannelEntity]),
    AuthModule,
    PermissionsModule,
  ],
  providers: [
    CalendarChannelMetadataService,
    CalendarChannelResolver,
    CalendarChannelGraphqlApiExceptionInterceptor,
  ],
  exports: [CalendarChannelMetadataService],
})
export class CalendarChannelMetadataModule {}
