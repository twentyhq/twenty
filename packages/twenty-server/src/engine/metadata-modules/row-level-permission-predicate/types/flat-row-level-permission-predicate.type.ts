/* @license Enterprise */

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RowLevelPermissionPredicateEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    RowLevelPermissionPredicateEntity,
    | FieldMetadataEntity
    | ObjectMetadataEntity
    | RoleEntity
    | RowLevelPermissionPredicateGroupEntity
    | WorkspaceEntity
  >;

export type FlatRowLevelPermissionPredicate = FlatEntityFrom<
  RowLevelPermissionPredicateEntity,
  RowLevelPermissionPredicateEntityRelationProperties
>;
