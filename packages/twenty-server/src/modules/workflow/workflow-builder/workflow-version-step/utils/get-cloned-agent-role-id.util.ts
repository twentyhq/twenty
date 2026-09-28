import { isDefined } from 'twenty-shared/utils';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const getClonedAgentRoleId = ({
  sourceRole,
  clonedAgentApplicationId,
}: {
  sourceRole: Pick<FlatRole, 'id' | 'applicationId'> | undefined;
  clonedAgentApplicationId: string;
}): string | undefined =>
  isDefined(sourceRole) && sourceRole.applicationId !== clonedAgentApplicationId
    ? sourceRole.id
    : undefined;
