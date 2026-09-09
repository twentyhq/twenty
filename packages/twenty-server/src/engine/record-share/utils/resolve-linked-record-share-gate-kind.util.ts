import { MetadataReadability } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  resolveRecordShareGateKind,
  type RecordShareGateKind,
} from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';

const MAX_INHERITED_READABILITY_DEPTH = 3;

// An INHERITED object is readable through its parent record, which an event
// payload does not carry, so a parent that is not open cannot be evaluated in
// memory and the link is denied instead of let through as open
export const resolveLinkedRecordShareGateKind = ({
  flatObjectMetadata,
  isOwningApplication,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  depth = 0,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  isOwningApplication: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  depth?: number;
}): RecordShareGateKind => {
  if (flatObjectMetadata.readability !== MetadataReadability.INHERITED) {
    return resolveRecordShareGateKind({
      readability: flatObjectMetadata.readability,
      isOwningApplication,
    });
  }

  if (depth >= MAX_INHERITED_READABILITY_DEPTH) {
    return 'deny';
  }

  const parents = resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

  if (parents.length === 0) {
    return 'deny';
  }

  const areAllParentsOpen = parents.every(
    ({ parentFlatObjectMetadata }) =>
      resolveLinkedRecordShareGateKind({
        flatObjectMetadata: parentFlatObjectMetadata,
        isOwningApplication,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        depth: depth + 1,
      }) === 'open',
  );

  return areAllParentsOpen ? 'open' : 'deny';
};
