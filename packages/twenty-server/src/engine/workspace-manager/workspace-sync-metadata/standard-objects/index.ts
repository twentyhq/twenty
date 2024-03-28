import { ActivityTargetObjectMetadata } from 'src/apps/activity/standard-objects/activity-target.object-metadata';
import { ActivityObjectMetadata } from 'src/apps/activity/standard-objects/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/apps/api-key/standard-objects/api-key.object-metadata';
import { AttachmentObjectMetadata } from 'src/apps/attachment/standard-objects/attachment.object-metadata';
import { BlocklistObjectMetadata } from 'src/apps/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { CommentObjectMetadata } from 'src/apps/activity/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/apps/company/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/apps/favorite/standard-objects/favorite.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/apps/messaging/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/apps/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/apps/messaging/standard-objects/message.object-metadata';
import { OpportunityObjectMetadata } from 'src/apps/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/apps/person/standard-objects/person.object-metadata';
import { ViewFieldObjectMetadata } from 'src/apps/view/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/apps/view/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/apps/view/standard-objects/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/apps/view/standard-objects/view.object-metadata';
import { WebhookObjectMetadata } from 'src/apps/webhook/standard-objects/webhook.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/apps/workspace-member/standard-objects/workspace-member.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { EventObjectMetadata } from 'src/apps/event/standard-objects/event.object-metadata';

export const standardObjectMetadataDefinitions = [
  ActivityTargetObjectMetadata,
  ActivityObjectMetadata,
  ApiKeyObjectMetadata,
  AttachmentObjectMetadata,
  BlocklistObjectMetadata,
  CommentObjectMetadata,
  CompanyObjectMetadata,
  ConnectedAccountObjectMetadata,
  EventObjectMetadata,
  FavoriteObjectMetadata,
  OpportunityObjectMetadata,
  PersonObjectMetadata,
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
