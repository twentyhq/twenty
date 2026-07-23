import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
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
    | 'viewField',
> = Record<string, MetadataUniversalFlatEntity<TMetadataName>>;

@Injectable()
export class ObjectSystemSideEffectsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectSystemSideEffectsOnDelete',
    description:
      'When an object is deleted, cascade-delete its engine-owned side effects: the reserved system fields, the default relation fields (forward field on the deleted object and reverse morph field on the standard object), every system index (reverse join-column indexes, the GIN searchVector index), its searchFieldMetadata rows, and its engine-owned views (the INDEX table view provisioned by objectSystemFieldsAndIndexViewOnCreate) with their view fields. View fields of the deleted system fields are cascaded too even when they live on another object view, which happens for the reverse relation fields. Every lookup walks a foreign key aggregator down from the deleted object (its fields, indexes, searchFieldMetadatas, views, then their view fields) and indexes into the flat entity maps, so the work is proportional to what the object owns and never to the size of the workspace. The engine is the sole authority for isSystemSideEffect entities on delete: the API object delete transpiler cascades only user-authored fields and indexes, and manifest deletion inference excludes these entities entirely. Caller-provided defaults (e.g. the name field) are NOT engine-owned and are deleted through normal deletion inference / the object delete transpiler.',
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

  // Reserved system fields and default relation fields. The reverse side of a
  // relation belongs to the object it targets, so it is reached through the
  // forward field pairing rather than by scanning the workspace fields.
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

  // System indexes of the object, plus the join-column indexes backing a
  // deleted field, which belong to the object that field belongs to.
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

    const indexOwnerFlatObjectMetadatas = [
      flatObjectMetadata,
      ...flatFieldMetadatasToDelete
        .map(
          (flatFieldMetadata) =>
            relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
              flatFieldMetadata.objectMetadataUniversalIdentifier
            ],
        )
        .filter(isDefined),
    ];

    const indexToDelete: FlatEntityToDelete<'index'> = {};

    for (const indexOwnerFlatObjectMetadata of indexOwnerFlatObjectMetadatas) {
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

  // Engine-owned views of the object, the INDEX table view today.
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

  // View fields of the deleted views, plus those displaying a deleted field on
  // a view we keep, which happens for the reverse relation fields.
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

    const viewFieldToDelete: FlatEntityToDelete<'viewField'> = {};

    for (const viewFieldUniversalIdentifier of viewFieldUniversalIdentifiers) {
      const flatViewField =
        relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
          viewFieldUniversalIdentifier
        ];

      if (
        !isDefined(flatViewField) ||
        flatViewField.isSystemSideEffect !== true
      ) {
        continue;
      }

      viewFieldToDelete[flatViewField.universalIdentifier] = flatViewField;
    }

    return viewFieldToDelete;
  }
}
