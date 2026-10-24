import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonRecordVisibilityModule } from 'src/engine/api/common/common-record-visibility/common-record-visibility.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageThreadTargetCreateManyPreQueryHook } from 'src/modules/messaging/common/query-hooks/message-thread-target/message-thread-target-create-many.pre-query-hook';
import { MessageThreadTargetCreateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message-thread-target/message-thread-target-create-one.pre-query-hook';

@Module({
  imports: [
    CommonRecordVisibilityModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
  ],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    MessageThreadTargetCreateOnePreQueryHook,
    MessageThreadTargetCreateManyPreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
