import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const buildCreatedMetadataEventBatch = ({
  metadataName,
  record,
}: {
  metadataName: AllMetadataName;
  record: { id: string } & Record<string, unknown>;
}) =>
  ({
    name: `metadata.${metadataName}.created`,
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    metadataName,
    type: 'created',
    events: [
      {
        type: 'created',
        metadataName,
        recordId: record.id,
        properties: { after: record },
      },
    ],
  }) as unknown as MetadataEventBatch;
