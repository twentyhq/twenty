import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatSkillMaps } from 'src/engine/metadata-modules/flat-skill/types/flat-skill-maps.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatWebhook } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-webhook.type';
import {
  type FlatCreateAgentAction,
  type FlatDeleteAgentAction,
  type FlatUpdateAgentAction,
  type UniversalCreateAgentAction,
  type UniversalDeleteAgentAction,
  type UniversalUpdateAgentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  type FlatCreateCommandMenuItemAction,
  type FlatDeleteCommandMenuItemAction,
  type FlatUpdateCommandMenuItemAction,
  type UniversalCreateCommandMenuItemAction,
  type UniversalDeleteCommandMenuItemAction,
  type UniversalUpdateCommandMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import {
  type FlatCreateFieldAction,
  type FlatDeleteFieldAction,
  type FlatUpdateFieldAction,
  type UniversalCreateFieldAction,
  type UniversalDeleteFieldAction,
  type UniversalUpdateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import {
  type FlatCreateFrontComponentAction,
  type FlatDeleteFrontComponentAction,
  type FlatUpdateFrontComponentAction,
  type UniversalCreateFrontComponentAction,
  type UniversalDeleteFrontComponentAction,
  type UniversalUpdateFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  type UniversalCreateIndexAction,
  type FlatCreateIndexAction,
  type FlatDeleteIndexAction,
  type FlatUpdateIndexAction,
  type UniversalDeleteIndexAction,
  type UniversalUpdateIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import {
  type FlatCreateLogicFunctionAction,
  type FlatDeleteLogicFunctionAction,
  type FlatUpdateLogicFunctionAction,
  type UniversalCreateLogicFunctionAction,
  type UniversalDeleteLogicFunctionAction,
  type UniversalUpdateLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  type FlatCreateNavigationMenuItemAction,
  type FlatDeleteNavigationMenuItemAction,
  type FlatUpdateNavigationMenuItemAction,
  type UniversalCreateNavigationMenuItemAction,
  type UniversalDeleteNavigationMenuItemAction,
  type UniversalUpdateNavigationMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/types/workspace-migration-navigation-menu-item-action.type';
import {
  type FlatCreateObjectAction,
  type FlatDeleteObjectAction,
  type FlatUpdateObjectAction,
  type UniversalCreateObjectAction,
  type UniversalDeleteObjectAction,
  type UniversalUpdateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import {
  type FlatCreatePageLayoutTabAction,
  type FlatDeletePageLayoutTabAction,
  type FlatUpdatePageLayoutTabAction,
  type UniversalCreatePageLayoutTabAction,
  type UniversalDeletePageLayoutTabAction,
  type UniversalUpdatePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type FlatCreatePageLayoutWidgetAction,
  type FlatDeletePageLayoutWidgetAction,
  type FlatUpdatePageLayoutWidgetAction,
  type UniversalCreatePageLayoutWidgetAction,
  type UniversalDeletePageLayoutWidgetAction,
  type UniversalUpdatePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import {
  type FlatCreatePageLayoutAction,
  type FlatDeletePageLayoutAction,
  type FlatUpdatePageLayoutAction,
  type UniversalCreatePageLayoutAction,
  type UniversalDeletePageLayoutAction,
  type UniversalUpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  type FlatCreateRoleTargetAction,
  type FlatDeleteRoleTargetAction,
  type FlatUpdateRoleTargetAction,
  type UniversalCreateRoleTargetAction,
  type UniversalDeleteRoleTargetAction,
  type UniversalUpdateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  type FlatCreateRoleAction,
  type FlatDeleteRoleAction,
  type FlatUpdateRoleAction,
  type UniversalCreateRoleAction,
  type UniversalDeleteRoleAction,
  type UniversalUpdateRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import {
  type FlatCreateRowLevelPermissionPredicateGroupAction,
  type FlatDeleteRowLevelPermissionPredicateGroupAction,
  type FlatUpdateRowLevelPermissionPredicateGroupAction,
  type UniversalCreateRowLevelPermissionPredicateGroupAction,
  type UniversalDeleteRowLevelPermissionPredicateGroupAction,
  type UniversalUpdateRowLevelPermissionPredicateGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action.type';
import {
  type FlatCreateRowLevelPermissionPredicateAction,
  type FlatDeleteRowLevelPermissionPredicateAction,
  type FlatUpdateRowLevelPermissionPredicateAction,
  type UniversalCreateRowLevelPermissionPredicateAction,
  type UniversalDeleteRowLevelPermissionPredicateAction,
  type UniversalUpdateRowLevelPermissionPredicateAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action.type';
import {
  type FlatCreateSkillAction,
  type FlatDeleteSkillAction,
  type FlatUpdateSkillAction,
  type UniversalCreateSkillAction,
  type UniversalDeleteSkillAction,
  type UniversalUpdateSkillAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import {
  type FlatCreateViewFieldAction,
  type FlatDeleteViewFieldAction,
  type FlatUpdateViewFieldAction,
  type UniversalCreateViewFieldAction,
  type UniversalDeleteViewFieldAction,
  type UniversalUpdateViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  type FlatCreateViewFilterGroupAction,
  type FlatDeleteViewFilterGroupAction,
  type FlatUpdateViewFilterGroupAction,
  type UniversalCreateViewFilterGroupAction,
  type UniversalDeleteViewFilterGroupAction,
  type UniversalUpdateViewFilterGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import {
  type FlatCreateViewFilterAction,
  type FlatDeleteViewFilterAction,
  type FlatUpdateViewFilterAction,
  type UniversalCreateViewFilterAction,
  type UniversalDeleteViewFilterAction,
  type UniversalUpdateViewFilterAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import {
  type FlatCreateViewGroupAction,
  type FlatDeleteViewGroupAction,
  type FlatUpdateViewGroupAction,
  type UniversalCreateViewGroupAction,
  type UniversalDeleteViewGroupAction,
  type UniversalUpdateViewGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import {
  type FlatCreateViewAction,
  type FlatDeleteViewAction,
  type FlatUpdateViewAction,
  type UniversalCreateViewAction,
  type UniversalDeleteViewAction,
  type UniversalUpdateViewAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import {
  type FlatCreateWebhookAction,
  type FlatDeleteWebhookAction,
  type FlatUpdateWebhookAction,
  type UniversalCreateWebhookAction,
  type UniversalDeleteWebhookAction,
  type UniversalUpdateWebhookAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';

export type AllFlatEntityTypesByMetadataName = {
  fieldMetadata: {
    flatEntityMaps: FlatEntityMaps<FlatFieldMetadata>;
    universalActions: {
      create: UniversalCreateFieldAction;
      update: UniversalUpdateFieldAction;
      delete: UniversalDeleteFieldAction;
    };
    flatActions: {
      create: FlatCreateFieldAction;
      update: FlatUpdateFieldAction;
      delete: FlatDeleteFieldAction;
    };
    flatEntity: FlatFieldMetadata;
    universalFlatEntity: UniversalFlatEntityFrom<
      FieldMetadataEntity,
      'fieldMetadata'
    >;
    entity: MetadataEntity<'fieldMetadata'>;
  };
  objectMetadata: {
    flatEntityMaps: FlatEntityMaps<FlatObjectMetadata>;
    universalActions: {
      create: UniversalCreateObjectAction;
      update: UniversalUpdateObjectAction;
      delete: UniversalDeleteObjectAction;
    };
    flatActions: {
      create: FlatCreateObjectAction;
      update: FlatUpdateObjectAction;
      delete: FlatDeleteObjectAction;
    };
    flatEntity: FlatObjectMetadata;
    universalFlatEntity: UniversalFlatObjectMetadata;
    entity: MetadataEntity<'objectMetadata'>;
  };
  view: {
    flatEntityMaps: FlatViewMaps;
    universalActions: {
      create: UniversalCreateViewAction;
      update: UniversalUpdateViewAction;
      delete: UniversalDeleteViewAction;
    };
    flatActions: {
      create: FlatCreateViewAction;
      update: FlatUpdateViewAction;
      delete: FlatDeleteViewAction;
    };
    flatEntity: FlatView;
    universalFlatEntity: UniversalFlatView;
    entity: MetadataEntity<'view'>;
  };
  viewField: {
    flatEntityMaps: FlatViewFieldMaps;
    universalActions: {
      create: UniversalCreateViewFieldAction;
      update: UniversalUpdateViewFieldAction;
      delete: UniversalDeleteViewFieldAction;
    };
    flatActions: {
      create: FlatCreateViewFieldAction;
      update: FlatUpdateViewFieldAction;
      delete: FlatDeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    universalFlatEntity: UniversalFlatViewField;
    entity: MetadataEntity<'viewField'>;
  };
  viewGroup: {
    flatEntityMaps: FlatViewGroupMaps;
    universalActions: {
      create: UniversalCreateViewGroupAction;
      update: UniversalUpdateViewGroupAction;
      delete: UniversalDeleteViewGroupAction;
    };
    flatActions: {
      create: FlatCreateViewGroupAction;
      update: FlatUpdateViewGroupAction;
      delete: FlatDeleteViewGroupAction;
    };
    flatEntity: FlatViewGroup;
    universalFlatEntity: UniversalFlatViewGroup;
    entity: MetadataEntity<'viewGroup'>;
  };
  rowLevelPermissionPredicate: {
    flatEntityMaps: FlatRowLevelPermissionPredicateMaps;
    universalActions: {
      create: UniversalCreateRowLevelPermissionPredicateAction;
      update: UniversalUpdateRowLevelPermissionPredicateAction;
      delete: UniversalDeleteRowLevelPermissionPredicateAction;
    };
    flatActions: {
      create: FlatCreateRowLevelPermissionPredicateAction;
      update: FlatUpdateRowLevelPermissionPredicateAction;
      delete: FlatDeleteRowLevelPermissionPredicateAction;
    };
    flatEntity: FlatRowLevelPermissionPredicate;
    universalFlatEntity: UniversalFlatRowLevelPermissionPredicate;
    entity: MetadataEntity<'rowLevelPermissionPredicate'>;
  };
  rowLevelPermissionPredicateGroup: {
    flatEntityMaps: FlatRowLevelPermissionPredicateGroupMaps;
    universalActions: {
      create: UniversalCreateRowLevelPermissionPredicateGroupAction;
      update: UniversalUpdateRowLevelPermissionPredicateGroupAction;
      delete: UniversalDeleteRowLevelPermissionPredicateGroupAction;
    };
    flatActions: {
      create: FlatCreateRowLevelPermissionPredicateGroupAction;
      update: FlatUpdateRowLevelPermissionPredicateGroupAction;
      delete: FlatDeleteRowLevelPermissionPredicateGroupAction;
    };
    flatEntity: FlatRowLevelPermissionPredicateGroup;
    universalFlatEntity: UniversalFlatRowLevelPermissionPredicateGroup;
    entity: MetadataEntity<'rowLevelPermissionPredicateGroup'>;
  };
  viewFilterGroup: {
    flatEntityMaps: FlatViewFilterGroupMaps;
    universalActions: {
      create: UniversalCreateViewFilterGroupAction;
      update: UniversalUpdateViewFilterGroupAction;
      delete: UniversalDeleteViewFilterGroupAction;
    };
    flatActions: {
      create: FlatCreateViewFilterGroupAction;
      update: FlatUpdateViewFilterGroupAction;
      delete: FlatDeleteViewFilterGroupAction;
    };
    flatEntity: FlatViewFilterGroup;
    universalFlatEntity: UniversalFlatViewFilterGroup;
    entity: MetadataEntity<'viewFilterGroup'>;
  };
  index: {
    flatEntityMaps: FlatEntityMaps<FlatIndexMetadata>;
    universalActions: {
      create: UniversalCreateIndexAction;
      update: UniversalUpdateIndexAction;
      delete: UniversalDeleteIndexAction;
    };
    flatActions: {
      create: FlatCreateIndexAction;
      update: FlatUpdateIndexAction;
      delete: FlatDeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    universalFlatEntity: UniversalFlatIndexMetadata;
    entity: MetadataEntity<'index'>;
  };
  logicFunction: {
    flatEntityMaps: FlatEntityMaps<FlatLogicFunction>;
    universalActions: {
      create: UniversalCreateLogicFunctionAction;
      update: UniversalUpdateLogicFunctionAction;
      delete: UniversalDeleteLogicFunctionAction;
    };
    flatActions: {
      create: FlatCreateLogicFunctionAction;
      update: FlatUpdateLogicFunctionAction;
      delete: FlatDeleteLogicFunctionAction;
    };
    flatEntity: FlatLogicFunction;
    universalFlatEntity: UniversalFlatLogicFunction;
    entity: MetadataEntity<'logicFunction'>;
  };
  viewFilter: {
    flatEntityMaps: FlatViewFilterMaps;
    universalActions: {
      create: UniversalCreateViewFilterAction;
      update: UniversalUpdateViewFilterAction;
      delete: UniversalDeleteViewFilterAction;
    };
    flatActions: {
      create: FlatCreateViewFilterAction;
      update: FlatUpdateViewFilterAction;
      delete: FlatDeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    universalFlatEntity: UniversalFlatViewFilter;
    entity: MetadataEntity<'viewFilter'>;
  };
  role: {
    flatEntityMaps: FlatEntityMaps<FlatRole>;
    universalActions: {
      create: UniversalCreateRoleAction;
      update: UniversalUpdateRoleAction;
      delete: UniversalDeleteRoleAction;
    };
    flatActions: {
      create: FlatCreateRoleAction;
      update: FlatUpdateRoleAction;
      delete: FlatDeleteRoleAction;
    };
    flatEntity: FlatRole;
    universalFlatEntity: UniversalFlatRole;
    entity: MetadataEntity<'role'>;
  };
  roleTarget: {
    flatEntityMaps: FlatRoleTargetMaps;
    universalActions: {
      create: UniversalCreateRoleTargetAction;
      update: UniversalUpdateRoleTargetAction;
      delete: UniversalDeleteRoleTargetAction;
    };
    flatActions: {
      create: FlatCreateRoleTargetAction;
      update: FlatUpdateRoleTargetAction;
      delete: FlatDeleteRoleTargetAction;
    };
    flatEntity: FlatRoleTarget;
    universalFlatEntity: UniversalFlatRoleTarget;
    entity: MetadataEntity<'roleTarget'>;
  };
  agent: {
    flatEntityMaps: FlatAgentMaps;
    universalActions: {
      create: UniversalCreateAgentAction;
      update: UniversalUpdateAgentAction;
      delete: UniversalDeleteAgentAction;
    };
    flatActions: {
      create: FlatCreateAgentAction;
      update: FlatUpdateAgentAction;
      delete: FlatDeleteAgentAction;
    };
    flatEntity: FlatAgent;
    universalFlatEntity: UniversalFlatAgent;
    entity: MetadataEntity<'agent'>;
  };
  skill: {
    flatEntityMaps: FlatSkillMaps;
    universalActions: {
      create: UniversalCreateSkillAction;
      update: UniversalUpdateSkillAction;
      delete: UniversalDeleteSkillAction;
    };
    flatActions: {
      create: FlatCreateSkillAction;
      update: FlatUpdateSkillAction;
      delete: FlatDeleteSkillAction;
    };
    flatEntity: FlatSkill;
    universalFlatEntity: UniversalFlatSkill;
    entity: MetadataEntity<'skill'>;
  };
  commandMenuItem: {
    flatEntityMaps: FlatCommandMenuItemMaps;
    universalActions: {
      create: UniversalCreateCommandMenuItemAction;
      update: UniversalUpdateCommandMenuItemAction;
      delete: UniversalDeleteCommandMenuItemAction;
    };
    flatActions: {
      create: FlatCreateCommandMenuItemAction;
      update: FlatUpdateCommandMenuItemAction;
      delete: FlatDeleteCommandMenuItemAction;
    };
    flatEntity: FlatCommandMenuItem;
    universalFlatEntity: UniversalFlatCommandMenuItem;
    entity: MetadataEntity<'commandMenuItem'>;
  };
  navigationMenuItem: {
    flatEntityMaps: FlatNavigationMenuItemMaps;
    universalActions: {
      create: UniversalCreateNavigationMenuItemAction;
      update: UniversalUpdateNavigationMenuItemAction;
      delete: UniversalDeleteNavigationMenuItemAction;
    };
    flatActions: {
      create: FlatCreateNavigationMenuItemAction;
      update: FlatUpdateNavigationMenuItemAction;
      delete: FlatDeleteNavigationMenuItemAction;
    };
    flatEntity: FlatNavigationMenuItem;
    universalFlatEntity: UniversalFlatNavigationMenuItem;
    entity: NavigationMenuItemEntity;
  };
  pageLayout: {
    flatEntityMaps: FlatPageLayoutMaps;
    universalActions: {
      create: UniversalCreatePageLayoutAction;
      update: UniversalUpdatePageLayoutAction;
      delete: UniversalDeletePageLayoutAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutAction;
      update: FlatUpdatePageLayoutAction;
      delete: FlatDeletePageLayoutAction;
    };
    flatEntity: FlatPageLayout;
    universalFlatEntity: UniversalFlatPageLayout;
    entity: MetadataEntity<'pageLayout'>;
  };
  pageLayoutWidget: {
    flatEntityMaps: FlatPageLayoutWidgetMaps;
    universalActions: {
      create: UniversalCreatePageLayoutWidgetAction;
      update: UniversalUpdatePageLayoutWidgetAction;
      delete: UniversalDeletePageLayoutWidgetAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutWidgetAction;
      update: FlatUpdatePageLayoutWidgetAction;
      delete: FlatDeletePageLayoutWidgetAction;
    };
    flatEntity: FlatPageLayoutWidget;
    universalFlatEntity: UniversalFlatPageLayoutWidget;
    entity: MetadataEntity<'pageLayoutWidget'>;
  };
  pageLayoutTab: {
    flatEntityMaps: FlatPageLayoutTabMaps;
    universalActions: {
      create: UniversalCreatePageLayoutTabAction;
      update: UniversalUpdatePageLayoutTabAction;
      delete: UniversalDeletePageLayoutTabAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutTabAction;
      update: FlatUpdatePageLayoutTabAction;
      delete: FlatDeletePageLayoutTabAction;
    };
    flatEntity: FlatPageLayoutTab;
    universalFlatEntity: UniversalFlatPageLayoutTab;
    entity: MetadataEntity<'pageLayoutTab'>;
  };
  frontComponent: {
    flatEntityMaps: FlatFrontComponentMaps;
    universalActions: {
      create: UniversalCreateFrontComponentAction;
      update: UniversalUpdateFrontComponentAction;
      delete: UniversalDeleteFrontComponentAction;
    };
    flatActions: {
      create: FlatCreateFrontComponentAction;
      update: FlatUpdateFrontComponentAction;
      delete: FlatDeleteFrontComponentAction;
    };
    flatEntity: FlatFrontComponent;
    universalFlatEntity: UniversalFlatFrontComponent;
    entity: MetadataEntity<'frontComponent'>;
  };
  webhook: {
    flatEntityMaps: FlatWebhookMaps;
    universalActions: {
      create: UniversalCreateWebhookAction;
      update: UniversalUpdateWebhookAction;
      delete: UniversalDeleteWebhookAction;
    };
    flatActions: {
      create: FlatCreateWebhookAction;
      update: FlatUpdateWebhookAction;
      delete: FlatDeleteWebhookAction;
    };
    flatEntity: FlatWebhook;
    universalFlatEntity: UniversalFlatWebhook;
    entity: MetadataEntity<'webhook'>;
  };
};
