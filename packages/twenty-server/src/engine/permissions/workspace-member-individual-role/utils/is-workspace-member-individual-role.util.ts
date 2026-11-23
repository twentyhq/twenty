import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX } from 'src/engine/permissions/workspace-member-individual-role/constants/workspace-member-individual-role.constant';

export const isWorkspaceMemberIndividualRole = (
  flatRole: Pick<FlatRole, 'isSystemSideEffect' | 'label'>,
): boolean =>
  flatRole.isSystemSideEffect &&
  flatRole.label.startsWith(WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX);
