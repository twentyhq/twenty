import { type DIRECT_MESSAGE_PERMISSION_OBJECTS } from 'src/engine/permissions/direct-message/constants/direct-message-permission-objects.constant';

export type DirectMessagePermissionObject =
  (typeof DIRECT_MESSAGE_PERMISSION_OBJECTS)[number];
