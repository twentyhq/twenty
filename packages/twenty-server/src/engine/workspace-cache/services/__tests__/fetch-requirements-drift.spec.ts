import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { WorkspaceFlatAgentMapCacheService } from 'src/engine/metadata-modules/flat-agent/services/workspace-flat-agent-map-cache.service';
import { WorkspaceFlatApplicationVariableMapCacheService } from 'src/engine/metadata-modules/flat-application-variable/services/workspace-flat-application-variable-map-cache.service';
import { WorkspaceFlatCommandMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-command-menu-item/services/workspace-flat-command-menu-item-map-cache.service';
import { WorkspaceFlatConnectionProviderMapCacheService } from 'src/engine/metadata-modules/flat-connection-provider/services/workspace-flat-connection-provider-map-cache.service';
import { WorkspaceFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-flat-field-metadata-map-cache.service';
import { WorkspaceFlatFieldPermissionMapCacheService } from 'src/engine/metadata-modules/flat-field-permission/services/workspace-flat-field-permission-map-cache.service';
import { WorkspaceFlatFrontComponentMapCacheService } from 'src/engine/metadata-modules/flat-front-component/services/workspace-flat-front-component-map-cache.service';
import { WorkspaceFlatIndexMapCacheService } from 'src/engine/metadata-modules/flat-index-metadata/services/workspace-flat-index-map-cache.service';
import { WorkspaceFlatNavigationMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-navigation-menu-item/services/workspace-flat-navigation-menu-item-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { WorkspaceFlatObjectPermissionMapCacheService } from 'src/engine/metadata-modules/flat-object-permission/services/workspace-flat-object-permission-map-cache.service';
import { WorkspaceFlatPageLayoutMapCacheService } from 'src/engine/metadata-modules/flat-page-layout/services/workspace-flat-page-layout-map-cache.service';
import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { WorkspaceFlatPermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag/services/workspace-flat-permission-flag-map-cache.service';
import { WorkspaceFlatRolePermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-role-permission-flag/services/workspace-flat-role-permission-flag-map-cache.service';
import { WorkspaceFlatRoleTargetMapCacheService } from 'src/engine/metadata-modules/flat-role-target/services/workspace-flat-role-target-map-cache.service';
import { WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/services/workspace-flat-row-level-permission-predicate-group-map-cache.service';
import { WorkspaceFlatRowLevelPermissionPredicateMapCacheService } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/services/workspace-flat-row-level-permission-predicate-map-cache.service';
import { WorkspaceFlatSearchFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-search-field-metadata/services/workspace-flat-search-field-metadata-map-cache.service';
import { WorkspaceFlatSkillMapCacheService } from 'src/engine/metadata-modules/flat-skill/services/workspace-flat-skill-map-cache.service';
import { WorkspaceFlatTimelineActivityTypeMapCacheService } from 'src/engine/metadata-modules/flat-timeline-activity-type/services/workspace-flat-timeline-activity-type-map-cache.service';
import { WorkspaceFlatViewFieldGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-field-group/services/workspace-flat-view-field-group-map-cache.service';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/metadata-modules/flat-view-field/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewFilterGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-filter-group/services/workspace-flat-view-filter-group-map-cache.service';
import { WorkspaceFlatViewFilterMapCacheService } from 'src/engine/metadata-modules/flat-view-filter/services/workspace-flat-view-filter-map-cache.service';
import { WorkspaceFlatViewGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-group/services/workspace-flat-view-group-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { WorkspaceFlatViewSortMapCacheService } from 'src/engine/metadata-modules/flat-view-sort/services/workspace-flat-view-sort-map-cache.service';
import { WorkspaceFlatWebhookMapCacheService } from 'src/engine/metadata-modules/flat-webhook/services/workspace-flat-webhook-map-cache.service';
import { WorkspaceFlatLogicFunctionMapCacheService } from 'src/engine/metadata-modules/logic-function/services/workspace-flat-logic-function-map-cache.service';
import { WorkspaceFlatRoleMapCacheService } from 'src/engine/metadata-modules/role/services/workspace-flat-role-map-cache.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WORKSPACE_CACHE_KEY } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import {
  type CacheEntityFetchShape,
  type WidenedCacheEntityFetchSpec,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { isGroupedCacheEntityFetchSpec } from 'src/engine/workspace-cache/utils/is-grouped-cache-entity-fetch-spec.util';

// groupBy keys widen the fetch at plan time, so they count as fetched columns
const getEffectiveColumns = (
  declared: WidenedCacheEntityFetchSpec,
): readonly string[] | true => {
  if (!isGroupedCacheEntityFetchSpec(declared)) {
    return declared;
  }

  return declared.columns === true
    ? true
    : [...declared.columns, ...declared.groupBy];
};

// The flat map provider owning each metadata name; its declared fetch shape
// is diffed against what the relation constants predict. The full Record
// makes adding a metadata name without registering its provider here a
// compile error, and the pairing test below catches a name mapped to the
// wrong provider.
const FLAT_PROVIDER_BY_METADATA_NAME: Record<
  AllMetadataName,
  { fetchRequirements: CacheEntityFetchShape }
> = {
  objectMetadata: new WorkspaceFlatObjectMetadataMapCacheService(),
  fieldMetadata: new WorkspaceFlatFieldMetadataMapCacheService(),
  index: new WorkspaceFlatIndexMapCacheService(),
  view: new WorkspaceFlatViewMapCacheService(),
  viewField: new WorkspaceFlatViewFieldMapCacheService(),
  viewFilter: new WorkspaceFlatViewFilterMapCacheService(),
  viewGroup: new WorkspaceFlatViewGroupMapCacheService(),
  viewSort: new WorkspaceFlatViewSortMapCacheService(),
  viewFilterGroup: new WorkspaceFlatViewFilterGroupMapCacheService(),
  viewFieldGroup: new WorkspaceFlatViewFieldGroupMapCacheService(),
  searchFieldMetadata: new WorkspaceFlatSearchFieldMetadataMapCacheService(),
  role: new WorkspaceFlatRoleMapCacheService(),
  roleTarget: new WorkspaceFlatRoleTargetMapCacheService(),
  permissionFlag: new WorkspaceFlatPermissionFlagMapCacheService(),
  rolePermissionFlag: new WorkspaceFlatRolePermissionFlagMapCacheService(),
  objectPermission: new WorkspaceFlatObjectPermissionMapCacheService(),
  fieldPermission: new WorkspaceFlatFieldPermissionMapCacheService(),
  rowLevelPermissionPredicate:
    new WorkspaceFlatRowLevelPermissionPredicateMapCacheService(),
  rowLevelPermissionPredicateGroup:
    new WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService(),
  pageLayout: new WorkspaceFlatPageLayoutMapCacheService(),
  pageLayoutTab: new WorkspaceFlatPageLayoutTabMapCacheService(),
  pageLayoutWidget: new WorkspaceFlatPageLayoutWidgetMapCacheService(),
  commandMenuItem: new WorkspaceFlatCommandMenuItemMapCacheService(),
  navigationMenuItem: new WorkspaceFlatNavigationMenuItemMapCacheService(),
  frontComponent: new WorkspaceFlatFrontComponentMapCacheService(),
  agent: new WorkspaceFlatAgentMapCacheService(),
  skill: new WorkspaceFlatSkillMapCacheService(),
  webhook: new WorkspaceFlatWebhookMapCacheService(),
  logicFunction: new WorkspaceFlatLogicFunctionMapCacheService(),
  timelineActivityType: new WorkspaceFlatTimelineActivityTypeMapCacheService(),
  connectionProvider: new WorkspaceFlatConnectionProviderMapCacheService(),
  applicationVariable: new WorkspaceFlatApplicationVariableMapCacheService(),
};

// Key presence is compile-enforced by FlatEntityFetchShape (with a
// compile-time canary in flat-entity-fetch-shape.type.ts against derivation
// collapse); these runtime checks carry only the column-level requirements
// the type cannot express: membership of id, universalIdentifier and the
// back-reference foreign key among the fetched columns.
const findChildForeignKeyColumn = (
  childMetadataName: AllMetadataName,
  sourceMetadataName: AllMetadataName,
  sourceRelationProperty: string,
): string | undefined => {
  const childManyToOneRelations = (
    ALL_MANY_TO_ONE_METADATA_RELATIONS as Record<
      string,
      Record<
        string,
        {
          metadataName: string;
          foreignKey: string;
          inverseOneToManyProperty: string | null;
        } | null
      >
    >
  )[childMetadataName];

  for (const relationValue of Object.values(childManyToOneRelations ?? {})) {
    if (
      isDefined(relationValue) &&
      relationValue.metadataName === sourceMetadataName &&
      relationValue.inverseOneToManyProperty === sourceRelationProperty
    ) {
      return relationValue.foreignKey;
    }
  }

  return undefined;
};

describe('fetch requirements drift against relation constants', () => {
  it('pairs every metadata name with the provider caching its flat maps key', () => {
    const violations: string[] = [];

    for (const [metadataName, provider] of Object.entries(
      FLAT_PROVIDER_BY_METADATA_NAME,
    ) as [AllMetadataName, { fetchRequirements: CacheEntityFetchShape }][]) {
      const decoratedCacheKey = Reflect.getMetadata(
        WORKSPACE_CACHE_KEY,
        provider.constructor,
      );
      const expectedCacheKey = getMetadataFlatEntityMapsKey(metadataName);

      if (decoratedCacheKey !== expectedCacheKey) {
        violations.push(
          `${metadataName}: paired with the provider caching "${decoratedCacheKey}" instead of "${expectedCacheKey}"`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it('every declared one-to-many relation is fetched with id, universalIdentifier and its foreign key', () => {
    const violations: string[] = [];

    for (const [sourceMetadataName, provider] of Object.entries(
      FLAT_PROVIDER_BY_METADATA_NAME,
    ) as [AllMetadataName, { fetchRequirements: CacheEntityFetchShape }][]) {
      const oneToManyRelations = (
        ALL_ONE_TO_MANY_METADATA_RELATIONS as Record<
          string,
          Record<string, { metadataName: AllMetadataName } | null>
        >
      )[sourceMetadataName];

      for (const [relationProperty, relationValue] of Object.entries(
        oneToManyRelations ?? {},
      )) {
        if (!isDefined(relationValue)) {
          continue;
        }

        const childMetadataName = relationValue.metadataName;

        const declared =
          provider.fetchRequirements[
            childMetadataName as keyof CacheEntityFetchShape
          ];

        if (!isDefined(declared)) {
          continue;
        }

        const effectiveColumns = getEffectiveColumns(declared);

        if (effectiveColumns === true) {
          continue;
        }

        const requiredColumns = ['id', 'universalIdentifier'];
        const childForeignKeyColumn = findChildForeignKeyColumn(
          childMetadataName,
          sourceMetadataName,
          relationProperty,
        );

        if (isDefined(childForeignKeyColumn)) {
          requiredColumns.push(childForeignKeyColumn);
        }

        for (const requiredColumn of requiredColumns) {
          if (!effectiveColumns.includes(requiredColumn)) {
            violations.push(
              `${sourceMetadataName}.${relationProperty} -> ${childMetadataName}: missing column ${requiredColumn}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('every declared many-to-one relation target is fetched with id and universalIdentifier', () => {
    const violations: string[] = [];

    for (const [sourceMetadataName, provider] of Object.entries(
      FLAT_PROVIDER_BY_METADATA_NAME,
    ) as [AllMetadataName, { fetchRequirements: CacheEntityFetchShape }][]) {
      const manyToOneRelations = (
        ALL_MANY_TO_ONE_METADATA_RELATIONS as Record<
          string,
          Record<string, { metadataName: AllMetadataName } | null>
        >
      )[sourceMetadataName];

      for (const [relationProperty, relationValue] of Object.entries(
        manyToOneRelations ?? {},
      )) {
        if (!isDefined(relationValue)) {
          continue;
        }

        const targetMetadataName = relationValue.metadataName;
        const declared =
          provider.fetchRequirements[
            targetMetadataName as keyof CacheEntityFetchShape
          ];

        if (!isDefined(declared)) {
          continue;
        }

        const effectiveColumns = getEffectiveColumns(declared);

        if (effectiveColumns === true) {
          continue;
        }

        for (const requiredColumn of ['id', 'universalIdentifier']) {
          if (!effectiveColumns.includes(requiredColumn)) {
            violations.push(
              `${sourceMetadataName}.${relationProperty} -> ${targetMetadataName}: missing column ${requiredColumn}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
