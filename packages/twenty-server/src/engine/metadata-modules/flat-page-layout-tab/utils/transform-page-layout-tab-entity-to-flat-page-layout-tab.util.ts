import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';

export const transformPageLayoutTabEntityToFlatPageLayoutTab = (
  pageLayoutTabEntity: PageLayoutTabEntity,
): FlatPageLayoutTab => {
  return {
    createdAt: pageLayoutTabEntity.createdAt.toISOString(),
    deletedAt: pageLayoutTabEntity.deletedAt?.toISOString() ?? null,
    updatedAt: pageLayoutTabEntity.updatedAt.toISOString(),
    id: pageLayoutTabEntity.id,
    title: pageLayoutTabEntity.title,
    position: pageLayoutTabEntity.position,
    pageLayoutId: pageLayoutTabEntity.pageLayoutId,
    workspaceId: pageLayoutTabEntity.workspaceId,
    universalIdentifier:
      pageLayoutTabEntity.universalIdentifier ?? pageLayoutTabEntity.id,
    applicationId: pageLayoutTabEntity.applicationId,
    widgetIds: pageLayoutTabEntity.widgets.map((widget) => widget.id),
  };
};
