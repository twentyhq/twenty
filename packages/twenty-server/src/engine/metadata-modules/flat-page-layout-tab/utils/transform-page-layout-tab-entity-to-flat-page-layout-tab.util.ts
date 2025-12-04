import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

export const transformPageLayoutTabEntityToFlatPageLayoutTab = (
  pageLayoutTabEntity: PageLayoutTabEntity,
): FlatPageLayoutTab => {
  return {
    createdAt: pageLayoutTabEntity.createdAt,
    deletedAt: pageLayoutTabEntity.deletedAt,
    updatedAt: pageLayoutTabEntity.updatedAt,
    id: pageLayoutTabEntity.id,
    title: pageLayoutTabEntity.title,
    position: pageLayoutTabEntity.position,
    pageLayoutId: pageLayoutTabEntity.pageLayoutId,
    workspaceId: pageLayoutTabEntity.workspaceId,
    universalIdentifier: pageLayoutTabEntity.universalIdentifier,
    applicationId: pageLayoutTabEntity.applicationId,
  };
};
