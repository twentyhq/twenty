import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export const getWorkspaceRuntimeReason = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: object;
}): string | undefined => {
  const has = (property: string): boolean =>
    property in flatEntity &&
    isDefined((flatEntity as Record<string, unknown>)[property]);

  switch (metadataName) {
    case 'webhook':
      return 'runtime configuration';
    case 'roleTarget':
      return has('userWorkspaceId') || has('apiKeyId')
        ? 'member or API key role assignment'
        : undefined;
    case 'commandMenuItem':
      return has('workflowVersionId') ? 'workflow trigger command' : undefined;
    case 'navigationMenuItem':
      if (has('userWorkspaceId')) {
        return 'personal navigation item';
      }

      return has('targetRecordId')
        ? 'navigation item pinned to a record'
        : undefined;
    default:
      return undefined;
  }
};
