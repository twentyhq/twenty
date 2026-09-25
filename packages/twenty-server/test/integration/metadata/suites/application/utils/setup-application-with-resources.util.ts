import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { seedBuiltFrontComponentSharedDependenciesFile } from 'test/integration/metadata/suites/application/utils/seed-built-front-component-shared-dependencies-file.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type ApplicationWithResources = {
  id: string;
  universalIdentifier: string;
  applicationRegistrationId: string;
  logicFunctionId: string;
  workflowActionLogicFunctionId: string;
  frontComponentId: string;
  agentId: string;
  skillId: string;
  connectionProviderName: string;
};

export const BUILT_FRONT_COMPONENT_CONTENT = 'dummy built component content';

export const SHARED_DEPENDENCIES_BUNDLE_CONTENT =
  'export const sharedDependenciesReady = true;\n';

const BUILT_FRONT_COMPONENT_PATH = 'src/front-components/component.mjs';

const SHARED_DEPENDENCIES_BUILT_PATH =
  'src/front-component-shared-dependencies.mjs';

const DEFAULT_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS = [
  SystemPermissionFlag.APPLICATIONS,
  SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
  SystemPermissionFlag.WORKFLOWS,
  SystemPermissionFlag.AI,
];

const findIdByUniversalIdentifier = async ({
  table,
  universalIdentifier,
}: {
  table: 'logicFunction' | 'frontComponent' | 'agent' | 'skill';
  universalIdentifier: string;
}): Promise<string> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT id FROM core."${table}"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  if (row === undefined) {
    throw new Error(`No ${table} synced for ${universalIdentifier}`);
  }

  return row.id;
};

// Syncs an application holding one of each resource an application token
// could reach, with a default role carrying the flags the endpoints check.
export const setupApplicationWithResources = async ({
  name,
  permissionFlagUniversalIdentifiers = DEFAULT_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS,
}: {
  name: string;
  permissionFlagUniversalIdentifiers?: string[];
}): Promise<ApplicationWithResources> => {
  const applicationUniversalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const logicFunctionUniversalIdentifier = uuidv4();
  const workflowActionLogicFunctionUniversalIdentifier = uuidv4();
  const frontComponentUniversalIdentifier = uuidv4();
  const agentUniversalIdentifier = uuidv4();
  const skillUniversalIdentifier = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const connectionProviderName = `${slug}-provider`;

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: `${name} for cross-application access tests`,
    sourcePath: `test-${applicationUniversalIdentifier}`,
  });

  jest.useRealTimers();

  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'BuiltFrontComponent',
    filePath: BUILT_FRONT_COMPONENT_PATH,
    fileBuffer: Buffer.from(BUILT_FRONT_COMPONENT_CONTENT),
    filename: 'component.mjs',
    contentType: 'application/javascript',
    expectToFail: false,
  });

  jest.useFakeTimers();

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        application: {
          universalIdentifier: applicationUniversalIdentifier,
          defaultRoleUniversalIdentifier: roleUniversalIdentifier,
          displayName: name,
          description: `${name} for cross-application access tests`,
          applicationVariables: {},
          packageJsonChecksum: null,
          yarnLockChecksum: null,
        },
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: 'Reaches application resources',
            canUpdateAllSettings: false,
            permissionFlagUniversalIdentifiers,
          },
        ],
        logicFunctions: [
          {
            universalIdentifier: logicFunctionUniversalIdentifier,
            name: `${slug}-handler`,
            description: 'Handles an HTTP route',
            handlerName: 'handler',
            sourceHandlerPath: 'src/handler.ts',
            builtHandlerPath: 'dist/handler.mjs',
            builtHandlerChecksum: 'handler-checksum',
            httpRouteTriggerSettings: {
              path: `/${slug}`,
              httpMethod: 'POST',
              isAuthRequired: true,
            },
            toolTriggerSettings: {},
          },
          {
            universalIdentifier: workflowActionLogicFunctionUniversalIdentifier,
            name: `${slug}-workflow-action`,
            description: 'Runs as a workflow step',
            handlerName: 'handler',
            sourceHandlerPath: 'src/workflow-action.ts',
            builtHandlerPath: 'dist/workflow-action.mjs',
            builtHandlerChecksum: 'workflow-action-checksum',
            workflowActionTriggerSettings: { label: `${name} action` },
          },
        ],
        frontComponents: [
          {
            universalIdentifier: frontComponentUniversalIdentifier,
            name: `${slug}-component`,
            description: `The ${name} component`,
            sourceComponentPath: 'src/front-components/component.tsx',
            builtComponentPath: BUILT_FRONT_COMPONENT_PATH,
            builtComponentChecksum: 'component-checksum',
            componentName: 'Component',
            isHeadless: false,
          },
        ],
        agents: [
          {
            universalIdentifier: agentUniversalIdentifier,
            name: `${slug}-agent`,
            label: `${name} agent`,
            description: 'An agent owned by the application',
            icon: 'IconRobot',
            prompt: `You are the ${name} agent.`,
          },
        ],
        skills: [
          {
            universalIdentifier: skillUniversalIdentifier,
            name: `${slug}-skill`,
            label: `${name} skill`,
            description: 'A skill owned by the application',
            icon: 'IconSparkles',
            content: `# ${name} skill`,
          },
        ],
        connectionProviders: [
          {
            universalIdentifier: uuidv4(),
            name: connectionProviderName,
            displayName: `${name} provider`,
            type: 'oauth',
            oauth: {
              authorizationEndpoint: 'https://provider.example.com/authorize',
              tokenEndpoint: 'https://provider.example.com/token',
              scopes: ['read'],
              clientIdVariable: 'PROVIDER_CLIENT_ID',
              clientSecretVariable: 'PROVIDER_CLIENT_SECRET',
            },
          },
        ],
      },
    }),
    expectToFail: false,
  });

  const [application] = await globalThis.testDataSource.query(
    `SELECT id, "applicationRegistrationId" FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  seedBuiltFrontComponentSharedDependenciesFile({
    applicationUniversalIdentifier,
    builtPath: SHARED_DEPENDENCIES_BUILT_PATH,
    content: SHARED_DEPENDENCIES_BUNDLE_CONTENT,
  });

  await globalThis.testDataSource.query(
    `UPDATE core."application"
     SET "frontComponentSharedDependenciesBuiltPath" = $1,
         "frontComponentSharedDependenciesChecksum" = $2
     WHERE id = $3`,
    [SHARED_DEPENDENCIES_BUILT_PATH, 'a'.repeat(64), application.id],
  );

  const [
    logicFunctionId,
    workflowActionLogicFunctionId,
    frontComponentId,
    agentId,
    skillId,
  ] = await Promise.all([
    findIdByUniversalIdentifier({
      table: 'logicFunction',
      universalIdentifier: logicFunctionUniversalIdentifier,
    }),
    findIdByUniversalIdentifier({
      table: 'logicFunction',
      universalIdentifier: workflowActionLogicFunctionUniversalIdentifier,
    }),
    findIdByUniversalIdentifier({
      table: 'frontComponent',
      universalIdentifier: frontComponentUniversalIdentifier,
    }),
    findIdByUniversalIdentifier({
      table: 'agent',
      universalIdentifier: agentUniversalIdentifier,
    }),
    findIdByUniversalIdentifier({
      table: 'skill',
      universalIdentifier: skillUniversalIdentifier,
    }),
  ]);

  return {
    id: application.id,
    universalIdentifier: applicationUniversalIdentifier,
    applicationRegistrationId: application.applicationRegistrationId,
    logicFunctionId,
    workflowActionLogicFunctionId,
    frontComponentId,
    agentId,
    skillId,
    connectionProviderName,
  };
};
