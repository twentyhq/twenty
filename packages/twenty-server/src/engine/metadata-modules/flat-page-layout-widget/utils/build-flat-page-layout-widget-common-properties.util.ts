import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';

export const buildFlatPageLayoutWidgetCommonProperties = ({
  widgetInput,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
}: {
  widgetInput: Pick<
    CreatePageLayoutWidgetInput,
    'pageLayoutTabId' | 'title' | 'type' | 'objectMetadataId' | 'position'
  >;
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

  return {
    pageLayoutTabId: widgetInput.pageLayoutTabId,
    pageLayoutTabUniversalIdentifier,
    title: widgetInput.title,
    type: widgetInput.type,
    objectMetadataId: widgetInput.objectMetadataId ?? null,
    objectMetadataUniversalIdentifier,
    position: widgetInput.position,
  };
};
