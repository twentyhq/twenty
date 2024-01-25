import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/api-key.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { CommentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { PipelineStepObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/pipeline-step.object-metadata';
import { ViewFieldObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';
import { WebhookObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/webhook.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

export const standardObjectMetadata = [
  ActivityTargetObjectMetadata,
  ActivityObjectMetadata,
  ApiKeyObjectMetadata,
  AttachmentObjectMetadata,
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
];
