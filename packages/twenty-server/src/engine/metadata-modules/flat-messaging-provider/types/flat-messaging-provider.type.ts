import { type MessagingProviderEntity } from 'src/engine/metadata-modules/messaging-provider/entities/messaging-provider.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatMessagingProvider = FlatEntityFrom<MessagingProviderEntity>;
