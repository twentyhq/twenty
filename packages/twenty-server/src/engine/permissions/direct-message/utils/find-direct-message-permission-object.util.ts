import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { DIRECT_MESSAGE_PERMISSION_OBJECTS } from 'src/engine/permissions/direct-message/constants/direct-message-permission-objects.constant';
import { type DirectMessagePermissionObject } from 'src/engine/permissions/direct-message/types/direct-message-permission-object.type';
import { hasDirectMessageIdentityStorage } from 'src/engine/permissions/direct-message/utils/has-direct-message-identity-storage.util';

export const findDirectMessagePermissionObject = ({
  metadataMaps,
  flatObjectMetadata,
}: {
  metadataMaps: Pick<
    PermissionsRowAccessRequest['metadataMaps'],
    'featureFlagsMap' | 'flatFieldMetadataMaps'
  >;
  flatObjectMetadata: Pick<
    PermissionsRowAccessRequest['flatObjectMetadata'],
    'universalIdentifier'
  >;
}): DirectMessagePermissionObject | undefined => {
  const hasIdentityStorage = hasDirectMessageIdentityStorage(
    metadataMaps.featureFlagsMap,
  );
  const hasConversationType = isDefined(
    metadataMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.fields.conversationType
        .universalIdentifier
    ],
  );

  if (!hasIdentityStorage && !hasConversationType) {
    return undefined;
  }

  return DIRECT_MESSAGE_PERMISSION_OBJECTS.find(
    (objectName) =>
      STANDARD_OBJECTS[objectName].universalIdentifier ===
      flatObjectMetadata.universalIdentifier,
  );
};
