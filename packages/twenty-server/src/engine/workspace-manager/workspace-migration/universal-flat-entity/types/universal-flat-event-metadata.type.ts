import { type EventMetadataEntity } from 'src/engine/metadata-modules/event-metadata/entities/event-metadata.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatEventMetadata = UniversalFlatEntityFrom<
  EventMetadataEntity,
  'eventMetadata'
>;
