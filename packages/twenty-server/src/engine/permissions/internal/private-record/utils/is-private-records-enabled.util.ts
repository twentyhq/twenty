/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isAgentChatRlsEnabled } from 'src/engine/permissions/agent-chat-access/utils/is-agent-chat-rls-enabled.util';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';

export const isPrivateRecordsEnabled = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata)
    ? !isAgentChatRlsEnabled(featureFlagsMap)
    : (featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED] ?? false);
