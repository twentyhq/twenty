import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

// Manifest apps author complete record-page stacks for their own objects, and
// manifest sync runs side-effect expansion: when the batch already carries a
// caller-authored FIELDS_WIDGET view or RECORD_PAGE layout for the object, the
// engine must not provision its default stack on top of it.
export const objectCarriesCallerAuthoredRecordPageStack = ({
  objectMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  objectMetadataUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): boolean => {
  const pendingFlatViews = Object.values(
    allFlatEntityOperationRecordByMetadataName.view?.flatEntityToCreate ?? {},
  ) as UniversalFlatView[];

  const callerAuthoredFieldsWidgetView = pendingFlatViews.some(
    (pendingFlatView) =>
      isDefined(pendingFlatView) &&
      pendingFlatView.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier &&
      pendingFlatView.type === ViewType.FIELDS_WIDGET &&
      pendingFlatView.isSystemSideEffect !== true,
  );

  if (callerAuthoredFieldsWidgetView) {
    return true;
  }

  const pendingFlatPageLayouts = Object.values(
    allFlatEntityOperationRecordByMetadataName.pageLayout?.flatEntityToCreate ??
      {},
  ) as UniversalFlatPageLayout[];

  return pendingFlatPageLayouts.some(
    (pendingFlatPageLayout) =>
      isDefined(pendingFlatPageLayout) &&
      pendingFlatPageLayout.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier &&
      pendingFlatPageLayout.type === PageLayoutType.RECORD_PAGE &&
      pendingFlatPageLayout.isSystemSideEffect !== true,
  );
};
