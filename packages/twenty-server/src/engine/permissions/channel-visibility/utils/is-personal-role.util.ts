import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { PERSONAL_ROLE_LABEL_PREFIX } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';

export const isPersonalRole = (
  flatRole: Pick<FlatRole, 'isSystemSideEffect' | 'label'>,
): boolean =>
  flatRole.isSystemSideEffect &&
  flatRole.label.startsWith(PERSONAL_ROLE_LABEL_PREFIX);
