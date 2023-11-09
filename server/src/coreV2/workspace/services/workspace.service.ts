import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { Workspace } from 'src/coreV2/workspace/workspace.entity';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {}
