import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/modules/messaging/common/query-hooks/messaging-query-hook.module';
import { CalendarQueryHookModule } from 'src/modules/calendar/common/query-hooks/calendar-query-hook.module';
import { CallRecordingQueryHookModule } from 'src/modules/call-recording/query-hooks/call-recording-query-hook.module';
import { DashboardQueryHookModule } from 'src/modules/dashboard/query-hooks/dashboard-query-hook.module';
import { BlocklistQueryHookModule } from 'src/modules/blocklist/query-hooks/blocklist-query-hook.module';
import { WorkspaceMemberQueryHookModule } from 'src/modules/workspace-member/query-hooks/workspace-member-query-hook.module';
import { NoteQueryHookModule } from 'src/modules/note/query-hooks/note-query-hook.module';
import { TaskQueryHookModule } from 'src/modules/task/query-hooks/task-query-hook.module';
import { TimelineQueryHookModule } from 'src/modules/timeline/query-hooks/timeline-query-hook.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { MessagingWebhooksModule } from 'src/modules/messaging-webhooks/messaging-webhooks.module';
import { ConnectedAccountSyncWebhooksModule } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhooks.module';
import { ChannelSyncModule } from 'src/modules/connected-account/channel-sync/channel-sync.module';
import { CreateCalendarEventModule } from 'src/modules/calendar/calendar-event-creation-manager/create-calendar-event.module';
import { CallRecordingModule } from 'src/modules/call-recording/call-recording.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { SendEmailModule } from 'src/modules/messaging/message-outbound-manager/send-email.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { OnboardingInviteSuggestionsModule } from 'src/modules/onboarding-invite-suggestions/onboarding-invite-suggestions.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessagingModule,
    CalendarModule,
    ConnectedAccountModule,
    OnboardingInviteSuggestionsModule,
    WorkflowModule,
    WorkspaceMemberModule,
    EmailingModule,
    MessagingWebhooksModule,
    ConnectedAccountSyncWebhooksModule,
    ChannelSyncModule,
    CreateCalendarEventModule,
    CallRecordingModule,
    DashboardModule,
    SendEmailModule,
    MessagingQueryHookModule,
    CalendarQueryHookModule,
    CallRecordingQueryHookModule,
    DashboardQueryHookModule,
    BlocklistQueryHookModule,
    WorkspaceMemberQueryHookModule,
    NoteQueryHookModule,
    TaskQueryHookModule,
    TimelineQueryHookModule,
  ],
})
export class ModulesModule {}
