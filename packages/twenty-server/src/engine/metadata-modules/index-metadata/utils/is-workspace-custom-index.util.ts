import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

// Indexes the metadata engine derives from fields back uniqueness, relations and search
export const isWorkspaceCustomIndex = ({
  flatIndex,
  workspaceCustomApplicationId,
}: {
  flatIndex: Pick<FlatIndexMetadata, 'applicationId' | 'isSystemSideEffect'>;
  workspaceCustomApplicationId: string;
}): boolean =>
  flatIndex.applicationId === workspaceCustomApplicationId &&
  !flatIndex.isSystemSideEffect;
