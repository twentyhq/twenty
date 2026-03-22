import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export const computeMetadataEventName = ({
  metadataName,
  type,
}: Pick<MetadataEvent, 'metadataName' | 'type'>) =>
  `metadata.${metadataName}.${type}` as const;
