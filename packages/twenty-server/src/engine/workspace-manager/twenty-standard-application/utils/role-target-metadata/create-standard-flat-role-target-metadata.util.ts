import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import { type AllStandardRoleTargetTypeName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-type-name.type';
import { type CreateStandardRoleTargetArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-target-metadata/create-standard-role-target-flat-metadata.util';

type StandardRoleTargetBuilder<T extends AllStandardRoleTargetTypeName> = (
  args: Omit<CreateStandardRoleTargetArgs<T>, 'context'>,
) => FlatRoleTarget | undefined;

export const STANDARD_FLAT_ROLE_TARGET_METADATA_BUILDERS = {
  agent: {
    helper: (
      _args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ): undefined => {
      // Helper agent does not have a standard role assigned
      return undefined;
    },
  },
} satisfies {
  [T in AllStandardRoleTargetTypeName]: {
    [P in AllStandardAgentName]: StandardRoleTargetBuilder<T>;
  };
};
