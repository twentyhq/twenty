import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-flat-field-metadata-map-cache.service';
import { WorkspaceOrmFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-orm-flat-field-metadata-map-cache.service';
import { WorkspaceFlatFieldPermissionMapCacheService } from 'src/engine/metadata-modules/flat-field-permission/services/workspace-flat-field-permission-map-cache.service';
import { WorkspaceFlatIndexMapCacheService } from 'src/engine/metadata-modules/flat-index-metadata/services/workspace-flat-index-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { WorkspaceFlatObjectPermissionMapCacheService } from 'src/engine/metadata-modules/flat-object-permission/services/workspace-flat-object-permission-map-cache.service';
import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { WorkspaceFlatPageLayoutMapCacheService } from 'src/engine/metadata-modules/flat-page-layout/services/workspace-flat-page-layout-map-cache.service';
import { WorkspaceFlatPermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag/services/workspace-flat-permission-flag-map-cache.service';
import { WorkspaceFlatRolePermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-role-permission-flag/services/workspace-flat-role-permission-flag-map-cache.service';
import { WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/services/workspace-flat-row-level-permission-predicate-group-map-cache.service';
import { WorkspaceFlatRowLevelPermissionPredicateMapCacheService } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/services/workspace-flat-row-level-permission-predicate-map-cache.service';
import { WorkspaceFlatViewFieldGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-field-group/services/workspace-flat-view-field-group-map-cache.service';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/metadata-modules/flat-view-field/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewFilterGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-filter-group/services/workspace-flat-view-filter-group-map-cache.service';
import { WorkspaceFlatViewFilterMapCacheService } from 'src/engine/metadata-modules/flat-view-filter/services/workspace-flat-view-filter-map-cache.service';
import { WorkspaceFlatViewGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-group/services/workspace-flat-view-group-map-cache.service';
import { WorkspaceFlatSearchFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-search-field-metadata/services/workspace-flat-search-field-metadata-map-cache.service';
import { WorkspaceFlatTimelineActivityTypeMapCacheService } from 'src/engine/metadata-modules/flat-timeline-activity-type/services/workspace-flat-timeline-activity-type-map-cache.service';
import { WorkspaceFlatSettingsMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-settings-menu-item/services/workspace-flat-settings-menu-item-map-cache.service';
import { WorkspaceFlatValidationRuleMapCacheService } from 'src/engine/metadata-modules/flat-validation-rule/services/workspace-flat-validation-rule-map-cache.service';
import { WorkspaceFlatViewSortMapCacheService } from 'src/engine/metadata-modules/flat-view-sort/services/workspace-flat-view-sort-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [
    WorkspaceManyOrAllFlatEntityMapsCacheService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
    WorkspaceFlatViewFieldGroupMapCacheService,
    WorkspaceFlatViewFilterMapCacheService,
    WorkspaceFlatViewFilterGroupMapCacheService,
    WorkspaceFlatIndexMapCacheService,
    WorkspaceFlatFieldMetadataMapCacheService,
    WorkspaceOrmFlatFieldMetadataMapCacheService,
    WorkspaceFlatViewGroupMapCacheService,
    WorkspaceFlatObjectPermissionMapCacheService,
    WorkspaceFlatFieldPermissionMapCacheService,
    WorkspaceFlatRolePermissionFlagMapCacheService,
    WorkspaceFlatPermissionFlagMapCacheService,
    WorkspaceFlatViewSortMapCacheService,
    WorkspaceFlatSearchFieldMetadataMapCacheService,
    WorkspaceFlatPageLayoutMapCacheService,
    WorkspaceFlatPageLayoutTabMapCacheService,
    WorkspaceFlatPageLayoutWidgetMapCacheService,
    WorkspaceFlatRowLevelPermissionPredicateMapCacheService,
    WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService,
    WorkspaceFlatTimelineActivityTypeMapCacheService,
    WorkspaceFlatSettingsMenuItemMapCacheService,
    WorkspaceFlatValidationRuleMapCacheService,
  ],
  exports: [WorkspaceManyOrAllFlatEntityMapsCacheService],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
