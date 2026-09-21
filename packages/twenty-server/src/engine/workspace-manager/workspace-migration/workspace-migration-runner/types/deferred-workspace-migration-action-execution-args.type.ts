import { type QueryRunner } from 'typeorm';

export type DeferredWorkspaceMigrationActionExecutionArgs<TPayload> = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  payload: TPayload;
  attempt: number;
  queryRunner: QueryRunner;
};
