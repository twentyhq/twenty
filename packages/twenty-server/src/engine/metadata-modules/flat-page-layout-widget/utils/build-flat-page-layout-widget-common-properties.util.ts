import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { getDefaultPageLayoutWidgetPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/get-default-page-layout-widget-position.util';

export const buildFlatPageLayoutWidgetCommonProperties = ({
  widgetInput,
  widgetIndexInTab,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
}: {
  widgetInput: Pick<
    CreatePageLayoutWidgetInput,
    | 'pageLayoutTabId'
    | 'title'
    | 'type'
    | 'objectMetadataId'
    | 'gridPosition'
    | 'position'
  >;
  widgetIndexInTab?: number;
} & Pick<
  AllFlatEntityMaps,
  'flatPageLayoutTabMaps' | 'flatObjectMetadataMaps'
>): Pick<
  FlatPageLayoutWidget,
  | 'pageLayoutTabId'
  | 'pageLayoutTabUniversalIdentifier'
  | 'title'
  | 'type'
  | 'objectMetadataId'
  | 'objectMetadataUniversalIdentifier'
  | 'gridPosition'
  | 'position'
> => {
  const {
    pageLayoutTabUniversalIdentifier,
    objectMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'pageLayoutWidget',
    foreignKeyValues: {
      pageLayoutTabId: widgetInput.pageLayoutTabId,
      objectMetadataId: widgetInput.objectMetadataId,
    },
    flatEntityMaps: { flatPageLayoutTabMaps, flatObjectMetadataMaps },
  });

  let position = widgetInput.position;

  if (!isDefined(position)) {
    const parentTab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetInput.pageLayoutTabId,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    if (isDefined(parentTab)) {
      position = getDefaultPageLayoutWidgetPosition(
        parentTab.layoutMode,
        widgetIndexInTab ?? 0,
      );
    }
  }

  return {
    pageLayoutTabId: widgetInput.pageLayoutTabId,
    pageLayoutTabUniversalIdentifier,
    title: widgetInput.title,
    type: widgetInput.type,
    objectMetadataId: widgetInput.objectMetadataId ?? null,
    objectMetadataUniversalIdentifier,
    gridPosition: widgetInput.gridPosition ?? null,
    position,
  };
};
