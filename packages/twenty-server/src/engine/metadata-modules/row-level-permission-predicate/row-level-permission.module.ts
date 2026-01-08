/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { RowLevelPermissionPredicateGroupResolver } from 'src/engine/metadata-modules/row-level-permission-predicate/resolvers/row-level-permission-predicate-group.resolver';
import { RowLevelPermissionPredicateResolver } from 'src/engine/metadata-modules/row-level-permission-predicate/resolvers/row-level-permission-predicate.resolver';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RowLevelPermissionPredicateEntity,
      RowLevelPermissionPredicateGroupEntity,
    ]),
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RowLevelPermissionPredicateService,
    RowLevelPermissionPredicateGroupService,
    RowLevelPermissionPredicateResolver,
    RowLevelPermissionPredicateGroupResolver,
  ],
  exports: [
    RowLevelPermissionPredicateService,
    RowLevelPermissionPredicateGroupService,
  ],
})
export class RowLevelPermissionModule {}
