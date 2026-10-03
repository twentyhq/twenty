import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const computeFlatRoleTargetByAgentIdMaps = <
  TFlatRoleTarget extends Pick<FlatRoleTarget, 'agentId'>,
>({
  flatRoleTargetMaps,
}: {
  flatRoleTargetMaps: {
    byUniversalIdentifier: Partial<Record<string, TFlatRoleTarget>>;
  };
}): Partial<Record<string, TFlatRoleTarget>> => {
  const flatRoleTargetByAgentIdMaps: Partial<Record<string, TFlatRoleTarget>> =
    {};

  for (const flatRoleTarget of Object.values(
    flatRoleTargetMaps.byUniversalIdentifier,
  )) {
    if (isDefined(flatRoleTarget?.agentId)) {
      flatRoleTargetByAgentIdMaps[flatRoleTarget.agentId] = flatRoleTarget;
    }
  }

  return flatRoleTargetByAgentIdMaps;
};
