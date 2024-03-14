import { ActivityTargetObjectMetadata } from 'src/modules/activity/activity-target.object-metadata';
import { ActivityObjectMetadata } from 'src/modules/activity/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/modules/api-key/api-key.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/attachment.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/blocklist/blocklist.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/calendar-channel.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/calendar-event-attendee.object-metadata';
import { CommentObjectMetadata } from 'src/modules/comment/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/favorite.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/message/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/message/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/message/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/message/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/message/message.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/person.object-metadata';
import { PipelineStepObjectMetadata } from 'src/modules/pipeline/pipeline-step.object-metadata';
import { ViewFieldObjectMetadata } from 'src/modules/view/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/modules/view/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/modules/view/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/view.object-metadata';
import { WebhookObjectMetadata } from 'src/modules/webhook/webhook.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/workspace-member.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/calendar-channel-event-association.object-metadata';

export const standardObjectMetadataDefinitions = [
  ActivityTargetObjectMetadata,
  ActivityObjectMetadata,
  ApiKeyObjectMetadata,
  AttachmentObjectMetadata,
  BlocklistObjectMetadata,
  CommentObjectMetadata,
  CompanyObjectMetadata,
  ConnectedAccountObjectMetadata,
  FavoriteObjectMetadata,
  OpportunityObjectMetadata,
  PersonObjectMetadata,
  PipelineStepObjectMetadata,
  ViewFieldObjectMetadata,
  ViewFilterObjectMetadata,
  ViewSortObjectMetadata,
  ViewObjectMetadata,
  WebhookObjectMetadata,
  WorkspaceMemberObjectMetadata,
  MessageThreadObjectMetadata,
  MessageObjectMetadata,
  MessageChannelObjectMetadata,
  MessageParticipantObjectMetadata,
  MessageChannelMessageAssociationObjectMetadata,
  CalendarEventObjectMetadata,
  CalendarChannelObjectMetadata,
  CalendarChannelEventAssociationObjectMetadata,
  CalendarEventAttendeeObjectMetadata,
];
