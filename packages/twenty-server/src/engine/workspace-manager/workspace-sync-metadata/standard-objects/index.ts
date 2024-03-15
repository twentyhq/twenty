import { ActivityTargetObjectMetadata } from 'src/business/modules/activity/activity-target.object-metadata';
import { ActivityObjectMetadata } from 'src/business/modules/activity/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/business/modules/api-key/api-key.object-metadata';
import { AttachmentObjectMetadata } from 'src/business/modules/attachment/attachment.object-metadata';
import { BlocklistObjectMetadata } from 'src/business/modules/calendar/blocklist.object-metadata';
import { CalendarEventObjectMetadata } from 'src/business/modules/calendar/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/business/modules/calendar/calendar-channel.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/business/modules/calendar/calendar-event-attendee.object-metadata';
import { CommentObjectMetadata } from 'src/business/modules/comment/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/business/modules/company/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/business/modules/connected-account/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/business/modules/favorite/favorite.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/business/modules/message/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/business/modules/message/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/business/modules/message/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/business/modules/message/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/business/modules/message/message.object-metadata';
import { OpportunityObjectMetadata } from 'src/business/modules/opportunity/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/business/modules/person/person.object-metadata';
import { PipelineStepObjectMetadata } from 'src/business/modules/pipeline-step/pipeline-step.object-metadata';
import { ViewFieldObjectMetadata } from 'src/business/modules/view/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/business/modules/view/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/business/modules/view/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/business/modules/view/view.object-metadata';
import { WebhookObjectMetadata } from 'src/business/modules/webhook/webhook.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/business/modules/workspace/workspace-member.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/business/modules/calendar/calendar-channel-event-association.object-metadata';

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
