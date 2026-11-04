import { type MessagingProviderEntity } from 'src/engine/metadata-modules/messaging-provider/entities/messaging-provider.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatMessagingProvider = UniversalFlatEntityFrom<
  MessagingProviderEntity,
  'messagingProvider'
>;
