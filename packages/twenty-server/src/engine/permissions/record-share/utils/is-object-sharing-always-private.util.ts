/* @license Enterprise */

import { type ObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';

export const isObjectSharingAlwaysPrivate = ({
  isShareRequired,
  isPrivateByDefault,
}: Pick<ObjectSharing, 'isShareRequired' | 'isPrivateByDefault'>): boolean =>
  isShareRequired || isPrivateByDefault;
