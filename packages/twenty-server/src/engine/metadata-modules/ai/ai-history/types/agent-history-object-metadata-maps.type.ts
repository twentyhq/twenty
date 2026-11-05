import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

export type AgentHistoryObjectMetadataMaps = Pick<
  FlatObjectMetadataMaps,
  'byUniversalIdentifier'
>;
