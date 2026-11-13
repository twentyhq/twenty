import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const IS_READ_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.isRead
    .universalIdentifier;

// Fence until upgrade:2-59:add-message-channel-message-association-is-read-field has reached every workspace
export const isMessageReadStateProvisioned = (
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >,
): boolean =>
  isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      IS_READ_FIELD_UNIVERSAL_IDENTIFIER
    ],
  );
