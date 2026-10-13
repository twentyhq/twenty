import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FieldMetadataEventRecord = {
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId?: string | null;
};

export const isFieldMetadataEventRecordVisible = ({
  record,
  isMorphFieldGroupEnabled,
  flatFieldMetadataMaps,
}: {
  record: FieldMetadataEventRecord | undefined;
  isMorphFieldGroupEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  if (!isDefined(record) || record.type !== FieldMetadataType.MORPH_RELATION) {
    return true;
  }

  if (isMorphRelationGroup(record)) {
    return isMorphFieldGroupEnabled;
  }

  return (
    !isMorphFieldGroupEnabled ||
    !isDefined(record.morphId) ||
    !isDefined(flatFieldMetadataMaps.byUniversalIdentifier[record.morphId])
  );
};
