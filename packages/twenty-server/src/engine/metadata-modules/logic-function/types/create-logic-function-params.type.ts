import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import type { InputJsonSchema } from 'twenty-shared/logic-function';

import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type CreateLogicFunctionParams = {
  id?: string;
  universalIdentifier?: string;
  name: string;
  description?: string;
  timeoutSeconds?: number;
  toolInputSchema: InputJsonSchema;
  isTool?: boolean;
  isBuildUpToDate: boolean;
  checksum?: string | null;
  handlerName: string;
  sourceHandlerPath: string;
  builtHandlerPath: string;
  cronTriggerSettings?: JsonbProperty<CronTriggerSettings>;
  databaseEventTriggerSettings?: JsonbProperty<DatabaseEventTriggerSettings>;
  httpRouteTriggerSettings?: JsonbProperty<HttpRouteTriggerSettings>;
};
