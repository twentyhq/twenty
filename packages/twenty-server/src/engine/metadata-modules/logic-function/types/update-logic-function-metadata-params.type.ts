import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type UpdateLogicFunctionMetadataParams = {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  toolInputSchema?: object;
  handlerName?: string;
  sourceHandlerPath?: string;
  isTool?: boolean;
  isBuildUpToDate?: boolean;
  checksum?: string;
  cronTriggerSettings?: JsonbProperty<CronTriggerSettings>;
  databaseEventTriggerSettings?: JsonbProperty<DatabaseEventTriggerSettings>;
  httpRouteTriggerSettings?: JsonbProperty<HttpRouteTriggerSettings>;
};
