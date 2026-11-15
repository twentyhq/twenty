import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type ViewOwnership = Pick<
  UniversalFlatView,
  'visibility' | 'createdByUserWorkspaceId'
>;

export const inheritScopeViewOwnerVisibility = <
  TFlatView extends ViewOwnership,
>({
  flatViewToCreate,
  ownerParentFlatView,
}: {
  flatViewToCreate: TFlatView;
  ownerParentFlatView: ViewOwnership;
}): TFlatView => ({
  ...flatViewToCreate,
  visibility: ownerParentFlatView.visibility,
  createdByUserWorkspaceId: ownerParentFlatView.createdByUserWorkspaceId,
});
