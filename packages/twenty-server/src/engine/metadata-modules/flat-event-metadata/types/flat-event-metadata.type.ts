import { type EventMetadataEntity } from 'src/engine/metadata-modules/event-metadata/entities/event-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatEventMetadata = FlatEntityFrom<EventMetadataEntity>;
