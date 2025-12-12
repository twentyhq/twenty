import { type STANDARD_ROLE_TARGET } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role-target.constant';
import { type AllStandardRoleTargetTypeName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-type-name.type';

export type AllStandardRoleTargetName<
  T extends AllStandardRoleTargetTypeName = AllStandardRoleTargetTypeName,
> = keyof (typeof STANDARD_ROLE_TARGET)[T];

