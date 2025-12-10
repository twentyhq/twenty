import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

export const transformPageLayoutEntityToFlatPageLayout = (
  pageLayoutEntity: PageLayoutEntity,
): FlatPageLayout => {
  return {
    createdAt: pageLayoutEntity.createdAt.toISOString(),
    deletedAt: pageLayoutEntity.deletedAt?.toISOString() ?? null,
    updatedAt: pageLayoutEntity.updatedAt.toISOString(),
    id: pageLayoutEntity.id,
    name: pageLayoutEntity.name,
    type: pageLayoutEntity.type,
    objectMetadataId: pageLayoutEntity.objectMetadataId,
    workspaceId: pageLayoutEntity.workspaceId,
    universalIdentifier:
      pageLayoutEntity.universalIdentifier ?? pageLayoutEntity.id,
    applicationId: pageLayoutEntity.applicationId,
    tabIds: pageLayoutEntity.tabs.map((tab) => tab.id),
  };
};
