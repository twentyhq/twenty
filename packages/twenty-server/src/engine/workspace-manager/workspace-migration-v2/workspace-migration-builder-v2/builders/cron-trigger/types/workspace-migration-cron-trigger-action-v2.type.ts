import { type FlatCronTriggerPropertiesToCompare } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger-properties-to-compare.type';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateCronTriggerAction = {
  type: 'create_cron_trigger';
  cronTrigger: FlatCronTrigger;
};

export type UpdateCronTriggerAction = {
  type: 'update_cron_trigger';
  cronTriggerId: string;
  updates: Array<
    {
      [P in FlatCronTriggerPropertiesToCompare]: PropertyUpdate<
        FlatCronTrigger,
        P
      >;
    }[FlatCronTriggerPropertiesToCompare]
  >;
};

export type DeleteCronTriggerAction = {
  type: 'delete_cron_trigger';
  cronTriggerId: string;
};

export type WorkspaceMigrationCronTriggerActionV2 =
  | CreateCronTriggerAction
  | UpdateCronTriggerAction
  | DeleteCronTriggerAction;
