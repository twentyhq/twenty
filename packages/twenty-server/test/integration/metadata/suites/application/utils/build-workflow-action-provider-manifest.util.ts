import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { type Manifest } from 'twenty-shared/application';

export const buildWorkflowActionProviderManifest = ({
  appId,
  roleId,
  workflowActionLogicFunctionId,
  internalLogicFunctionId,
}: {
  appId: string;
  roleId: string;
  workflowActionLogicFunctionId: string;
  internalLogicFunctionId: string;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      logicFunctions: [
        {
          universalIdentifier: workflowActionLogicFunctionId,
          name: 'Provided workflow action',
          sourceHandlerPath: 'provided-action.ts',
          builtHandlerPath: 'provided-action.mjs',
          builtHandlerChecksum: '',
          handlerName: 'handler',
          workflowActionTriggerSettings: {
            label: 'Provided action',
            icon: 'IconBolt',
          },
        },
        {
          universalIdentifier: internalLogicFunctionId,
          name: 'Internal function',
          sourceHandlerPath: 'internal.ts',
          builtHandlerPath: 'internal.mjs',
          builtHandlerChecksum: '',
          handlerName: 'handler',
        },
      ],
    },
  });
