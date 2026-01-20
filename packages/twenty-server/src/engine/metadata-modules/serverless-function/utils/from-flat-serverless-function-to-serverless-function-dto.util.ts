import { isDefined } from 'twenty-shared/utils';

import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { fromFlatCronTriggerToCronTriggerDto } from 'src/engine/metadata-modules/cron-trigger/utils/from-flat-cron-trigger-to-cron-trigger-dto.util';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto } from 'src/engine/metadata-modules/database-event-trigger/utils/from-flat-database-event-trigger-to-database-event-trigger-dto.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { fromFlatRouteTriggerToRouteTriggerDto } from 'src/engine/metadata-modules/route-trigger/utils/from-flat-route-trigger-to-route-trigger-dto.util';
import { type ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const fromFlatServerlessFunctionToServerlessFunctionDto = ({
  flatServerlessFunction,
  flatCronTriggerMaps,
  flatDatabaseEventTriggerMaps,
  flatRouteTriggerMaps,
}: {
  flatServerlessFunction: FlatServerlessFunction;
  flatCronTriggerMaps: FlatEntityMaps<FlatCronTrigger>;
  flatDatabaseEventTriggerMaps: FlatEntityMaps<FlatDatabaseEventTrigger>;
  flatRouteTriggerMaps: FlatEntityMaps<FlatRouteTrigger>;
}): ServerlessFunctionDTO => {
  const cronTriggers = flatServerlessFunction.cronTriggerIds
    .map((id) => flatCronTriggerMaps.byId[id])
    .filter(isDefined)
    .map(fromFlatCronTriggerToCronTriggerDto);

  const databaseEventTriggers = flatServerlessFunction.databaseEventTriggerIds
    .map((id) => flatDatabaseEventTriggerMaps.byId[id])
    .filter(isDefined)
    .map(fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto);

  const routeTriggers = flatServerlessFunction.routeTriggerIds
    .map((id) => flatRouteTriggerMaps.byId[id])
    .filter(isDefined)
    .map(fromFlatRouteTriggerToRouteTriggerDto);

  return {
    id: flatServerlessFunction.id,
    name: flatServerlessFunction.name,
    description: flatServerlessFunction.description ?? undefined,
    runtime: flatServerlessFunction.runtime,
    timeoutSeconds: flatServerlessFunction.timeoutSeconds,
    latestVersion: flatServerlessFunction.latestVersion ?? undefined,
    handlerPath: flatServerlessFunction.handlerPath,
    handlerName: flatServerlessFunction.handlerName,
    publishedVersions: flatServerlessFunction.publishedVersions,
    toolInputSchema: flatServerlessFunction.toolInputSchema ?? undefined,
    isTool: flatServerlessFunction.isTool,
    applicationId: flatServerlessFunction.applicationId ?? undefined,
    workspaceId: flatServerlessFunction.workspaceId,
    createdAt: new Date(flatServerlessFunction.createdAt),
    updatedAt: new Date(flatServerlessFunction.updatedAt),
    cronTriggers,
    databaseEventTriggers,
    routeTriggers,
  };
};
