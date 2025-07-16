import { Injectable } from '@nestjs/common';
import { RunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-args.type';

@Injectable()
export class WorkspaceSchemaMigrationRunnerService {
  constructor() {}

  runWorkspaceSchemaMigration = ({
    workspaceMigration,
    queryRunner,
  }: RunnerArgs) => {};
}
