import { ObjectLiteral, Repository } from 'typeorm';

import { FlattenCompositeTypes } from 'src/engine/twenty-orm/interfaces/flatten-composite-types.interface';

export class WorkspaceRepository<
  Entity extends ObjectLiteral,
> extends Repository<FlattenCompositeTypes<Entity>> {}
