/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isAgentChatRlsEnabled } from 'src/engine/permissions/agent-chat-access/utils/is-agent-chat-rls-enabled.util';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';

// Chat objects are reached through individual role rules once chat RLS is on
export const isObjectPrivateByDefault = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata) &&
  !isAgentChatRlsEnabled(featureFlagsMap);
