import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import { type AllStandardRoleTargetTypeName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-type-name.type';
import {
  type CreateStandardRoleTargetArgs,
  createStandardRoleTargetFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/role-target-metadata/create-standard-role-target-flat-metadata.util';

type StandardRoleTargetBuilder<T extends AllStandardRoleTargetTypeName> = (
  args: Omit<CreateStandardRoleTargetArgs<T>, 'context'>,
) => FlatRoleTarget | undefined;

export const STANDARD_FLAT_ROLE_TARGET_METADATA_BUILDERS = {
  agent: {
    dashboardBuilder: (
      args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ) =>
      createStandardRoleTargetFlatMetadata({
        ...args,
        context: {
          roleTargetTypeName: 'agent',
          roleTargetName: 'dashboardBuilder',
          roleName: 'dashboardManager',
          agentName: 'dashboardBuilder',
        },
      }),
    dataManipulator: (
      args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ) =>
      createStandardRoleTargetFlatMetadata({
        ...args,
        context: {
          roleTargetTypeName: 'agent',
          roleTargetName: 'dataManipulator',
          roleName: 'dataManipulator',
          agentName: 'dataManipulator',
        },
      }),
    helper: (
      _args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ): undefined => {
      // Helper agent does not have a standard role assigned
      return undefined;
    },
    metadataBuilder: (
      args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ) =>
      createStandardRoleTargetFlatMetadata({
        ...args,
        context: {
          roleTargetTypeName: 'agent',
          roleTargetName: 'metadataBuilder',
          roleName: 'dataModelManager',
          agentName: 'metadataBuilder',
        },
      }),
    researcher: (
      _args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ): undefined => {
      // Researcher agent does not have a standard role assigned
      return undefined;
    },
    workflowBuilder: (
      args: Omit<CreateStandardRoleTargetArgs<'agent'>, 'context'>,
    ) =>
      createStandardRoleTargetFlatMetadata({
        ...args,
        context: {
          roleTargetTypeName: 'agent',
          roleTargetName: 'workflowBuilder',
          roleName: 'workflowManager',
          agentName: 'workflowBuilder',
        },
      }),
  },
} satisfies {
  [T in AllStandardRoleTargetTypeName]: {
    [P in AllStandardAgentName]: StandardRoleTargetBuilder<T>;
  };
};

