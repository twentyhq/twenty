import { v5 } from 'uuid';

export const getRevokedChannelObjectPermissionUniversalIdentifier = ({
  objectUniversalIdentifier,
  roleUniversalIdentifier,
}: {
  objectUniversalIdentifier: string;
  roleUniversalIdentifier: string;
}): string =>
  v5(
    `channelVisibilityRevoke:${objectUniversalIdentifier}`,
    roleUniversalIdentifier,
  );
