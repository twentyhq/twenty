import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const TWENTY_STANDARD_APPLICATION = {
  universalIdentifier: '20202020-64aa-4b6f-b003-9c74b97cee20',
  name: 'Twenty Standard',
  description:
    'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
  version: '1.0.0',
  sourcePath: 'cli-sync', // TODO double check value
  sourceType: 'local',
} as const satisfies CreateApplicationInput;

export const TWENTY_WORKFLOW_APPLICATION = {
  universalIdentifier: '20202020-a1cf-4cda-896c-0c19bbba6f00',
  name: 'Twenty Workflows',
  description: 'Workflow automation engine for Twenty CRM',
  version: '1.0.0',
  sourcePath: 'cli-sync',
  sourceType: 'local',
} as const satisfies CreateApplicationInput;

export type CreateApplicationInput = Omit<
  ApplicationEntity,
  | 'workspaceId'
  | 'serverlessFunctionLayerId'
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'workspace'
  | 'agents'
  | 'applicationVariables'
  | 'objects'
  | 'serverlessFunctions'
>;
export type TwentyStandardApplicationUniversalIdentifiers =
  | (typeof TWENTY_STANDARD_APPLICATION)['universalIdentifier']
  | (typeof TWENTY_WORKFLOW_APPLICATION)['universalIdentifier'];
