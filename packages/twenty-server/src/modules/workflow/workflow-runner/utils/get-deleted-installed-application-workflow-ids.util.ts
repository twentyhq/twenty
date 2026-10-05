import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

export const getDeletedInstalledApplicationWorkflowIds = ({
  events,
  workspaceOwnedApplicationIds,
}: {
  events: MetadataEvent[];
  workspaceOwnedApplicationIds: string[];
}): string[] =>
  events.flatMap((event) =>
    event.type === 'deleted' &&
    !workspaceOwnedApplicationIds.includes(
      event.properties.before.applicationId,
    )
      ? [event.recordId]
      : [],
  );
