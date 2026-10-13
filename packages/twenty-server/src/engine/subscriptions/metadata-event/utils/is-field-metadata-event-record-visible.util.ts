import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FieldMetadataEventRecord = {
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId?: string | null;
};

export const isFieldMetadataEventRecordVisible = ({
  record,
  isMorphRelationHeadEnabled,
  flatFieldMetadataMaps,
}: {
  record: FieldMetadataEventRecord | undefined;
  isMorphRelationHeadEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  if (!isDefined(record) || record.type !== FieldMetadataType.MORPH_RELATION) {
    return true;
  }

  if (isMorphRelationHead(record)) {
    return isMorphRelationHeadEnabled;
  }

  return (
    !isMorphRelationHeadEnabled ||
    !isDefined(record.morphId) ||
    !isDefined(flatFieldMetadataMaps.byUniversalIdentifier[record.morphId])
  );
};
