import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { ActivitydObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { ApiKeyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/api-key.object-metadata';
import { AttachmentpyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { ViewFieldObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view-sort.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';
import { WebhookObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/webook.object-metadata';

export const standardObjectMetadata = [
  WebhookObjectMetadata,
  ApiKeyObjectMetadata,
  ViewSortObjectMetadata,
  ViewFilterObjectMetadata,
  ViewFieldObjectMetadata,
  ViewObjectMetadata,
  ActivityTargetObjectMetadata,
  ActivitydObjectMetadata,
  AttachmentpyObjectMetadata,
];
