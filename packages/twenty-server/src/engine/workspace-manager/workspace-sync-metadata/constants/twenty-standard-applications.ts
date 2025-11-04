import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const TWENTY_STANDARD_APPLICATION = {
  universalIdentifier: '20202020-64aa-4b6f-b003-9c74b97cee20',
  name: 'Twenty Standard',
  description:
    'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
  version: '1.0.0',
  sourcePath: 'cli-sync', // TODO double check value
  serverlessFunctionLayerId: null,
  agents: [],
  applicationVariables: [],
  objects: [],
  serverlessFunctions: [],
  sourceType: 'local',
} as const satisfies Omit<
  ApplicationEntity,
  'workspaceId' | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'workspace'
>;

export const TWENTY_WORKFLOW_APPLICATION = {
  universalIdentifier: '20202020-a1cf-4cda-896c-0c19bbba6f00',
  name: 'Twenty Workflows',
  description: 'Workflow automation engine for Twenty CRM',
  version: '1.0.0',
  sourcePath: 'system/twenty-workflow',
  serverlessFunctionLayerId: null,
  agents: [],
  applicationVariables: [],
  objects: [],
  serverlessFunctions: [],
  sourceType: 'local',
} as const satisfies Omit<
  ApplicationEntity,
  'workspaceId' | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'workspace'
>;
