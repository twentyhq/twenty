import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { buildMorphRelationHeadFieldPermissionUpdates } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-field-permission-updates.util';
import { buildMorphRelationHeadPageLayoutWidgetUpdates } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-page-layout-widget-updates.util';
import { buildMorphRelationHeadViewFieldOperations } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-view-field-operations.util';
import { buildMorphRelationHeadViewFilterUpdates } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-view-filter-updates.util';
import { buildMorphRelationHeadViewSortUpdates } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-view-sort-updates.util';
import { computeMorphRelationReferenceDestinations } from 'src/engine/metadata-modules/morph-relation-head/utils/compute-morph-relation-reference-destinations.util';

export const buildMorphRelationHeadSwitchOperations = ({
  isMorphRelationHeadEnabled,
  workspaceCustomApplicationUniversalIdentifier,
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatViewFilterMaps,
  flatViewSortMaps,
  flatFieldPermissionMaps,
  flatPageLayoutWidgetMaps,
}: {
  isMorphRelationHeadEnabled: boolean;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  flatViewFieldGroupMaps: FlatEntityMaps<FlatViewFieldGroup>;
  flatViewFilterMaps: FlatEntityMaps<FlatViewFilter>;
  flatViewSortMaps: FlatEntityMaps<FlatViewSort>;
  flatFieldPermissionMaps: FlatEntityMaps<FlatFieldPermission>;
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
}) => {
  const { destinationFieldByOriginFieldId, morphIdsWithoutHead } =
    computeMorphRelationReferenceDestinations({
      isMorphRelationHeadEnabled,
      flatFieldMetadataMaps,
    });

  return {
    morphIdsWithoutHead,
    ...buildMorphRelationHeadViewFieldOperations({
      isMorphRelationHeadEnabled,
      destinationFieldByOriginFieldId,
      workspaceCustomApplicationUniversalIdentifier,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
    }),
    viewFiltersToUpdate: buildMorphRelationHeadViewFilterUpdates({
      destinationFieldByOriginFieldId,
      flatViewFilterMaps,
    }),
    viewSortsToUpdate: buildMorphRelationHeadViewSortUpdates({
      destinationFieldByOriginFieldId,
      flatViewSortMaps,
    }),
    fieldPermissionsToUpdate: buildMorphRelationHeadFieldPermissionUpdates({
      destinationFieldByOriginFieldId,
      flatFieldPermissionMaps,
    }),
    pageLayoutWidgetsToUpdate: buildMorphRelationHeadPageLayoutWidgetUpdates({
      destinationFieldByOriginFieldId,
      flatPageLayoutWidgetMaps,
    }),
  };
};
