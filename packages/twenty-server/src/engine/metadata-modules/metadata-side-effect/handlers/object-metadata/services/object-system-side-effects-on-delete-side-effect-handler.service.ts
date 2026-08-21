import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { filterSystemSideEffectFlatViewFieldsToDelete } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/filter-system-side-effect-flat-view-fields-to-delete.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

type RelatedFlatEntityMaps =
  BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];

type FlatEntityToDelete<
  TMetadataName extends
    | 'fieldMetadata'
    | 'index'
    | 'searchFieldMetadata'
    | 'view'
    | 'viewField'
    | 'viewFieldGroup'
    | 'pageLayout'
    | 'pageLayoutTab'
    | 'pageLayoutWidget',
> = Record<string, MetadataUniversalFlatEntity<TMetadataName>>;

@Injectable()
export class ObjectSystemSideEffectsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectSystemSideEffectsOnDelete',
    description:
      'When an object is deleted, cascade-delete its engine-owned side effects: the reserved system fields, the default relation fields (forward field on the deleted object and reverse morph field on the standard object), every system index (reverse join-column indexes, the GIN searchVector index), its searchFieldMetadata rows, its engine-owned views (the INDEX table view and the FIELDS_WIDGET record-page view) with their view fields and view field groups, and its engine-owned record-page layout stack (pageLayout, pageLayoutTab, pageLayoutWidget). View fields of the deleted system fields are cascaded too even when they live on another object view, which happens for the reverse relation fields. Every lookup walks a foreign key aggregator down from the deleted object (its fields, indexes, searchFieldMetadatas, views, then their view fields and groups; page layouts have no aggregator on the object, so they are resolved by their objectMetadata reference) and indexes into the flat entity maps. The engine is the sole authority for isSystemSideEffect entities on delete: the API object delete transpiler cascades only user-authored fields and indexes and emits nothing for the layout stack, and manifest deletion inference excludes these entities entirely, so without these buckets the layout stack would only ever disappear through raw DB foreign key cascade, behind the engine back. Caller-provided defaults (e.g. the name field) are NOT engine-owned and are deleted through normal deletion inference / the object delete transpiler.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const fieldMetadataToDelete = this.computeFieldMetadataToDelete({
      flatObjectMetadata,
      relatedFlatEntityMaps,
    });
    const flatFieldMetadatasToDelete = Object.values(fieldMetadataToDelete);

    const viewToDelete = this.computeViewToDelete({
      flatObjectMetadata,
      relatedFlatEntityMaps,
    });

    const pageLayoutToDelete = this.computePageLayoutToDelete({
      flatObjectMetadata,
      relatedFlatEntityMaps,
    });
    const pageLayoutTabToDelete = this.computePageLayoutTabToDelete({
      relatedFlatEntityMaps,
      flatPageLayoutsToDelete: Object.values(pageLayoutToDelete),
    });

    const flatEntityToDeleteByMetadataName = {
      fieldMetadata: fieldMetadataToDelete,
      index: this.computeIndexToDelete({
        flatObjectMetadata,
        relatedFlatEntityMaps,
        flatFieldMetadatasToDelete,
      }),
      searchFieldMetadata: this.computeSearchFieldMetadataToDelete({
        flatObjectMetadata,
        relatedFlatEntityMaps,
      }),
      view: viewToDelete,
      viewField: this.computeViewFieldToDelete({
        relatedFlatEntityMaps,
        flatViewsToDelete: Object.values(viewToDelete),
        flatFieldMetadatasToDelete,
      }),
      viewFieldGroup: this.computeViewFieldGroupToDelete({
        relatedFlatEntityMaps,
        flatViewsToDelete: Object.values(viewToDelete),
      }),
      pageLayout: pageLayoutToDelete,
      pageLayoutTab: pageLayoutTabToDelete,
      pageLayoutWidget: this.computePageLayoutWidgetToDelete({
        relatedFlatEntityMaps,
        flatPageLayoutTabsToDelete: Object.values(pageLayoutTabToDelete),
      }),
    };

    const operations = Object.fromEntries(
      Object.entries(flatEntityToDeleteByMetadataName)
        .filter(
          ([, flatEntityToDelete]) =>
            Object.keys(flatEntityToDelete).length > 0,
        )
        .map(([metadataName, flatEntityToDelete]) => [
          metadataName,
          { flatEntityToDelete },
        ]),
    ) as MetadataSideEffectOperationsByMetadataName;

    if (Object.keys(operations).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations,
    };
  }

  private computeFieldMetadataToDelete({
    flatObjectMetadata,
    relatedFlatEntityMaps,
  }: {
    flatObjectMetadata: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
  }): FlatEntityToDelete<'fieldMetadata'> {
    const fieldMetadataToDelete: FlatEntityToDelete<'fieldMetadata'> = {};

    for (const fieldUniversalIdentifier of flatObjectMetadata.fieldUniversalIdentifiers) {
      const flatFieldMetadata =
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          fieldUniversalIdentifier
        ];

      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.isSystemSideEffect !== true
      ) {
        continue;
      }

      fieldMetadataToDelete[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;

      const { relationTargetFieldMetadataUniversalIdentifier } =
        flatFieldMetadata;

      if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
        continue;
      }

      const reverseFlatFieldMetadata =
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          relationTargetFieldMetadataUniversalIdentifier
        ];

      if (
        !isDefined(reverseFlatFieldMetadata) ||
        reverseFlatFieldMetadata.isSystemSideEffect !== true
      ) {
        continue;
      }

      fieldMetadataToDelete[reverseFlatFieldMetadata.universalIdentifier] =
        reverseFlatFieldMetadata;
    }

    return fieldMetadataToDelete;
  }

  private computeIndexToDelete({
    flatObjectMetadata,
    relatedFlatEntityMaps,
    flatFieldMetadatasToDelete,
  }: {
    flatObjectMetadata: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
    flatFieldMetadatasToDelete: MetadataUniversalFlatEntity<'fieldMetadata'>[];
  }): FlatEntityToDelete<'index'> {
    const deletedFieldUniversalIdentifiers = new Set(
      flatFieldMetadatasToDelete.map(
        (flatFieldMetadata) => flatFieldMetadata.universalIdentifier,
      ),
    );

    const indexOwnerFlatObjectMetadataByUniversalIdentifier = new Map([
      [flatObjectMetadata.universalIdentifier, flatObjectMetadata],
    ]);

    for (const flatFieldMetadata of flatFieldMetadatasToDelete) {
      const ownerFlatObjectMetadata =
        relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          flatFieldMetadata.objectMetadataUniversalIdentifier
        ];

      if (isDefined(ownerFlatObjectMetadata)) {
        indexOwnerFlatObjectMetadataByUniversalIdentifier.set(
          ownerFlatObjectMetadata.universalIdentifier,
          ownerFlatObjectMetadata,
        );
      }
    }

    const indexToDelete: FlatEntityToDelete<'index'> = {};

    for (const indexOwnerFlatObjectMetadata of indexOwnerFlatObjectMetadataByUniversalIdentifier.values()) {
      for (const indexUniversalIdentifier of indexOwnerFlatObjectMetadata.indexMetadataUniversalIdentifiers) {
        const flatIndexMetadata =
          relatedFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
            indexUniversalIdentifier
          ];

        if (
          !isDefined(flatIndexMetadata) ||
          flatIndexMetadata.isSystemSideEffect !== true
        ) {
          continue;
        }

        const belongsToObject =
          flatIndexMetadata.objectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier;
        const referencesDeletedField =
          flatIndexMetadata.universalFlatIndexFieldMetadatas.some(
            (universalFlatIndexFieldMetadata) =>
              deletedFieldUniversalIdentifiers.has(
                universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier,
              ),
          );

        if (!belongsToObject && !referencesDeletedField) {
          continue;
        }

        indexToDelete[flatIndexMetadata.universalIdentifier] =
          flatIndexMetadata;
      }
    }

    return indexToDelete;
  }

  private computeSearchFieldMetadataToDelete({
    flatObjectMetadata,
    relatedFlatEntityMaps,
  }: {
    flatObjectMetadata: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
  }): FlatEntityToDelete<'searchFieldMetadata'> {
    const searchFieldMetadataToDelete: FlatEntityToDelete<'searchFieldMetadata'> =
      {};

    for (const searchFieldMetadataUniversalIdentifier of flatObjectMetadata.searchFieldMetadataUniversalIdentifiers) {
      const flatSearchFieldMetadata =
        relatedFlatEntityMaps.flatSearchFieldMetadataMaps.byUniversalIdentifier[
          searchFieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatSearchFieldMetadata)) {
        continue;
      }

      searchFieldMetadataToDelete[flatSearchFieldMetadata.universalIdentifier] =
        flatSearchFieldMetadata;
    }

    return searchFieldMetadataToDelete;
  }

  private computeViewToDelete({
    flatObjectMetadata,
    relatedFlatEntityMaps,
  }: {
    flatObjectMetadata: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
  }): FlatEntityToDelete<'view'> {
    const viewToDelete: FlatEntityToDelete<'view'> = {};

    for (const viewUniversalIdentifier of flatObjectMetadata.viewUniversalIdentifiers) {
      const flatView =
        relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
          viewUniversalIdentifier
        ];

      if (!isDefined(flatView) || flatView.isSystemSideEffect !== true) {
        continue;
      }

      viewToDelete[flatView.universalIdentifier] = flatView;
    }

    return viewToDelete;
  }

  private computeViewFieldToDelete({
    relatedFlatEntityMaps,
    flatViewsToDelete,
    flatFieldMetadatasToDelete,
  }: {
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
    flatViewsToDelete: MetadataUniversalFlatEntity<'view'>[];
    flatFieldMetadatasToDelete: MetadataUniversalFlatEntity<'fieldMetadata'>[];
  }): FlatEntityToDelete<'viewField'> {
    const viewFieldUniversalIdentifiers = [
      ...flatViewsToDelete.flatMap(
        (flatView) => flatView.viewFieldUniversalIdentifiers,
      ),
      ...flatFieldMetadatasToDelete.flatMap(
        (flatFieldMetadata) => flatFieldMetadata.viewFieldUniversalIdentifiers,
      ),
    ];

    return filterSystemSideEffectFlatViewFieldsToDelete({
      viewFieldUniversalIdentifiers,
      flatViewFieldMaps: relatedFlatEntityMaps.flatViewFieldMaps,
    });
  }

  private computeViewFieldGroupToDelete({
    relatedFlatEntityMaps,
    flatViewsToDelete,
  }: {
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
    flatViewsToDelete: MetadataUniversalFlatEntity<'view'>[];
  }): FlatEntityToDelete<'viewFieldGroup'> {
    const viewFieldGroupToDelete: FlatEntityToDelete<'viewFieldGroup'> = {};

    for (const flatView of flatViewsToDelete) {
      for (const viewFieldGroupUniversalIdentifier of flatView.viewFieldGroupUniversalIdentifiers) {
        const flatViewFieldGroup =
          relatedFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
            viewFieldGroupUniversalIdentifier
          ];

        if (
          !isDefined(flatViewFieldGroup) ||
          flatViewFieldGroup.isSystemSideEffect !== true
        ) {
          continue;
        }

        viewFieldGroupToDelete[flatViewFieldGroup.universalIdentifier] =
          flatViewFieldGroup;
      }
    }

    return viewFieldGroupToDelete;
  }

  // Page layouts have no foreign key aggregator on the object flat entity, so
  // they are resolved by their objectMetadata reference.
  private computePageLayoutToDelete({
    flatObjectMetadata,
    relatedFlatEntityMaps,
  }: {
    flatObjectMetadata: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
  }): FlatEntityToDelete<'pageLayout'> {
    const pageLayoutToDelete: FlatEntityToDelete<'pageLayout'> = {};

    for (const flatPageLayout of Object.values(
      relatedFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatPageLayout) ||
        flatPageLayout.objectMetadataUniversalIdentifier !==
          flatObjectMetadata.universalIdentifier ||
        flatPageLayout.isSystemSideEffect !== true
      ) {
        continue;
      }

      pageLayoutToDelete[flatPageLayout.universalIdentifier] = flatPageLayout;
    }

    return pageLayoutToDelete;
  }

  private computePageLayoutTabToDelete({
    relatedFlatEntityMaps,
    flatPageLayoutsToDelete,
  }: {
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
    flatPageLayoutsToDelete: MetadataUniversalFlatEntity<'pageLayout'>[];
  }): FlatEntityToDelete<'pageLayoutTab'> {
    const pageLayoutTabToDelete: FlatEntityToDelete<'pageLayoutTab'> = {};

    for (const flatPageLayout of flatPageLayoutsToDelete) {
      for (const tabUniversalIdentifier of flatPageLayout.tabUniversalIdentifiers) {
        const flatPageLayoutTab =
          relatedFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
            tabUniversalIdentifier
          ];

        if (
          !isDefined(flatPageLayoutTab) ||
          flatPageLayoutTab.isSystemSideEffect !== true
        ) {
          continue;
        }

        pageLayoutTabToDelete[flatPageLayoutTab.universalIdentifier] =
          flatPageLayoutTab;
      }
    }

    return pageLayoutTabToDelete;
  }

  private computePageLayoutWidgetToDelete({
    relatedFlatEntityMaps,
    flatPageLayoutTabsToDelete,
  }: {
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
    flatPageLayoutTabsToDelete: MetadataUniversalFlatEntity<'pageLayoutTab'>[];
  }): FlatEntityToDelete<'pageLayoutWidget'> {
    const pageLayoutWidgetToDelete: FlatEntityToDelete<'pageLayoutWidget'> = {};

    for (const flatPageLayoutTab of flatPageLayoutTabsToDelete) {
      for (const widgetUniversalIdentifier of flatPageLayoutTab.widgetUniversalIdentifiers) {
        const flatPageLayoutWidget =
          relatedFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
            widgetUniversalIdentifier
          ];

        if (
          !isDefined(flatPageLayoutWidget) ||
          flatPageLayoutWidget.isSystemSideEffect !== true
        ) {
          continue;
        }

        pageLayoutWidgetToDelete[flatPageLayoutWidget.universalIdentifier] =
          flatPageLayoutWidget;
      }
    }

    return pageLayoutWidgetToDelete;
  }
}
