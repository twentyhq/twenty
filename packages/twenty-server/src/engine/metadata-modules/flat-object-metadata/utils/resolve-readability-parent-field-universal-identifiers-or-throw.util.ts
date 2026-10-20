import { MetadataReadability } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

const PARENT_RELATION_TYPES = [
  RelationType.MANY_TO_ONE,
  RelationType.ONE_TO_MANY,
];

// Parent fields only mean something while the object inherits, so they are cleared otherwise
export const resolveReadabilityParentFieldUniversalIdentifiersOrThrow = ({
  flatObjectMetadata,
  readability,
  requestedReadabilityParentFieldUniversalIdentifiers,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  readability: MetadataReadability;
  requestedReadabilityParentFieldUniversalIdentifiers:
    | string[]
    | null
    | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] | null => {
  if (readability !== MetadataReadability.INHERITED) {
    if (isNonEmptyArray(requestedReadabilityParentFieldUniversalIdentifiers)) {
      throw new ObjectMetadataException(
        'Readability parent fields can only be set on an object with INHERITED readability',
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

    return null;
  }

  const readabilityParentFieldUniversalIdentifiers = [
    ...new Set(
      requestedReadabilityParentFieldUniversalIdentifiers ??
        flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ??
        [],
    ),
  ];

  if (!isNonEmptyArray(readabilityParentFieldUniversalIdentifiers)) {
    throw new ObjectMetadataException(
      'An object with INHERITED readability needs at least one parent field',
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  for (const universalIdentifier of readabilityParentFieldUniversalIdentifiers) {
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier];

    const isRelationOfObject =
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataId === flatObjectMetadata.id &&
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
      PARENT_RELATION_TYPES.includes(
        flatFieldMetadata.settings?.relationType as RelationType,
      );

    if (!isRelationOfObject) {
      throw new ObjectMetadataException(
        `Readability parent field ${universalIdentifier} is not a relation of object ${flatObjectMetadata.nameSingular}`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }
  }

  return readabilityParentFieldUniversalIdentifiers;
};
