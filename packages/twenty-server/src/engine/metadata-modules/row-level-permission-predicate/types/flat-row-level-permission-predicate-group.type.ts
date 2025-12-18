/* @license Enterprise */

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RowLevelPermissionPredicateGroupRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    RowLevelPermissionPredicateGroupEntity,
    | RoleEntity
    | WorkspaceEntity
    | RowLevelPermissionPredicateGroupEntity
    | RowLevelPermissionPredicateEntity
  >;

export type FlatRowLevelPermissionPredicateGroup = FlatEntityFrom<
  RowLevelPermissionPredicateGroupEntity,
  RowLevelPermissionPredicateGroupRelationProperties
>;
