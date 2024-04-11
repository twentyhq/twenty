import { ActivityTargetObjectMetadata } from 'src/modules/activity/standard-objects/activity-target.object-metadata';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/modules/api-key/standard-objects/api-key.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CommentObjectMetadata } from 'src/modules/activity/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { ViewFieldObjectMetadata } from 'src/modules/view/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/modules/view/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/modules/view/standard-objects/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/standard-objects/view.object-metadata';
import { WebhookObjectMetadata } from 'src/modules/webhook/standard-objects/webhook.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { EventObjectMetadata } from 'src/modules/event/standard-objects/event.object-metadata';

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
  CalendarEventParticipantObjectMetadata,
];
