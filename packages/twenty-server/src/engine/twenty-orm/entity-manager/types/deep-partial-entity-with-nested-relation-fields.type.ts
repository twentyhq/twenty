import { type DeepPartial } from 'typeorm/common/DeepPartial';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import {
  type ConnectObject,
  type DisconnectObject,
  type EntityRelationFields,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';

export type DeepPartialWithNestedRelationFields<T> = Omit<
  DeepPartial<T>,
  EntityRelationFields<T>
> & {
  [K in keyof T]?: T[K] extends BaseWorkspaceEntity | null
    ? DeepPartial<T[K]> | ConnectObject | DisconnectObject
    : DeepPartial<T[K]>;
};
