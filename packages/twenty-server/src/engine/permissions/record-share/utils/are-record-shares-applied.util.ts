/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isAgentChatRlsEnabled } from 'src/engine/permissions/agent-chat-access/utils/is-agent-chat-rls-enabled.util';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { isRecordSharingEnabled } from 'src/engine/permissions/record-share/utils/is-record-sharing-enabled.util';

// TODO(@charlesBochet): read the flag alone once chat RLS is enabled everywhere
export const areRecordSharesApplied = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata)
    ? !isAgentChatRlsEnabled(featureFlagsMap)
    : isRecordSharingEnabled({ featureFlagsMap });
