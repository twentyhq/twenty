import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageChannelStandardFlatIndexMetadatas = ({}: Omit<
  CreateStandardIndexArgs<'messageChannel'>,
  'context'
>): Record<
  AllStandardObjectIndexName<'messageChannel'>,
  FlatIndexMetadata
> => ({});
