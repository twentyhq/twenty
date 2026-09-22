import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type DeferredWorkspaceMigrationActionExecutionArgs<TPayload> = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  payload: TPayload;
  allFlatEntityMaps: AllFlatEntityMaps;
  attempt: number;
  queryRunner: QueryRunner;
};
