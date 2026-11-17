import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export const canReadObject = async (
  repository: Pick<
    WorkspaceRepository,
    'recordReadRestrictions' | 'flatObjectMetadata' | 'isReadDisabled'
  >,
): Promise<boolean> =>
  !repository.recordReadRestrictions.unreadableObjectMetadataIds.has(
    repository.flatObjectMetadata.id,
  ) && !(await repository.isReadDisabled());
