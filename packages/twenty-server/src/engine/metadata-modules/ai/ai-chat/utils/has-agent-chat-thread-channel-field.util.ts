import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const hasAgentChatThreadChannelField = ({
  flatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
}): boolean =>
  isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier
    ],
  );
