import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatRelationTargetFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-relation-target-field-metadata.type';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-item-with-field-maps-to-flat-object-metadata-without-fields.util';
import { CachedFieldMetadataEntity } from 'src/engine/metadata-modules/types/cached-field-metadata-entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import { isCachedFieldMetadataEntityOfType } from 'src/engine/utils/is-cached-field-metadata-of-type.util';

const fromCachedRelationFieldMetadataEntityToFlatRelationTargetFieldMetadata = <
  T extends FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION,
>(
  cachedFieldMetadataEntity: CachedFieldMetadataEntity<T>,
): FlatRelationTargetFieldMetadata => {
  return {
    ...cachedFieldMetadataEntity,
    uniqueIdentifier:
      cachedFieldMetadataEntity.standardId ?? cachedFieldMetadataEntity.id,
    type: cachedFieldMetadataEntity.type,
  };
};

type CachedFieldMetadataEntityAndObjectMetadataMap<
  T extends FieldMetadataType,
> = {
  objectMetadataMaps: ObjectMetadataMaps;
  cachedFieldMetadataEntity: CachedFieldMetadataEntity<T>;
};

export const fromCachedFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  {
    cachedFieldMetadataEntity,
    objectMetadataMaps,
  }: CachedFieldMetadataEntityAndObjectMetadataMap<T>,
  // This is intended to be abstract return type
): FlatFieldMetadata => {
  if (
    isCachedFieldMetadataEntityOfType(
      cachedFieldMetadataEntity,
      FieldMetadataType.RELATION,
    ) ||
    isCachedFieldMetadataEntityOfType(
      cachedFieldMetadataEntity,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    const relationTargetObjectMetadataItemWithFieldsMaps =
      objectMetadataMaps.byId[
        cachedFieldMetadataEntity.relationTargetObjectMetadataId
      ];

    if (!isDefined(relationTargetObjectMetadataItemWithFieldsMaps)) {
      throw new WorkspaceMetadataCacheException(
        'Cache object is not up to date',
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    const flatRelationTargetObjectMetadata =
      fromObjectMetadataItemWithFieldMapsToFlatObjectMetadataWithoutFields(
        relationTargetObjectMetadataItemWithFieldsMaps,
      );

    const relationTargetCachedFieldMetadata =
      relationTargetObjectMetadataItemWithFieldsMaps.fieldsById[
        cachedFieldMetadataEntity.relationTargetFieldMetadataId
      ];

    if (!isDefined(relationTargetCachedFieldMetadata)) {
      throw new WorkspaceMetadataCacheException(
        'Cache field is not up to date',
        WorkspaceMetadataCacheExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }
    if (
      !isCachedFieldMetadataEntityOfType(
        relationTargetCachedFieldMetadata,
        FieldMetadataType.RELATION,
      )
    ) {
      throw new WorkspaceMetadataCacheException(
        'Cache field is invalid',
        WorkspaceMetadataCacheExceptionCode.FIELD_METADATA_INVALID,
      );
    }

    const flatRelationTargetFieldMetadata =
      fromCachedRelationFieldMetadataEntityToFlatRelationTargetFieldMetadata(
        relationTargetCachedFieldMetadata,
      );

    return {
      ...cachedFieldMetadataEntity,
      uniqueIdentifier:
        cachedFieldMetadataEntity.standardId ?? cachedFieldMetadataEntity.id,
      flatRelationTargetFieldMetadata,
      flatRelationTargetObjectMetadata,
      type: cachedFieldMetadataEntity.type,
    } satisfies FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
  }

  return {
    ...cachedFieldMetadataEntity,
    uniqueIdentifier:
      cachedFieldMetadataEntity.standardId ?? cachedFieldMetadataEntity.id,
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  };
};
