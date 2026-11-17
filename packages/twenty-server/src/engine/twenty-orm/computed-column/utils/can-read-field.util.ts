import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export const canReadField = ({
  repository,
  flatFieldMetadata,
}: {
  repository: Pick<WorkspaceRepository, 'recordReadRestrictions'>;
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'id'>;
}): boolean =>
  !repository.recordReadRestrictions.unreadableFieldMetadataIds.has(
    flatFieldMetadata.id,
  );
