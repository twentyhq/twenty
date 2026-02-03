import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
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
import { type FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import {
  type FlatCreateAgentAction,
  type FlatDeleteAgentAction,
  type FlatUpdateAgentAction,
  type UniversalDeleteAgentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  type FlatCreateCommandMenuItemAction,
  type FlatDeleteCommandMenuItemAction,
  type FlatUpdateCommandMenuItemAction,
  type UniversalDeleteCommandMenuItemAction,
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
  type UniversalDeleteFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  type FlatCreateIndexAction,
  type FlatDeleteIndexAction,
  type FlatUpdateIndexAction,
  type UniversalDeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import {
  type FlatCreateLogicFunctionAction,
  type FlatDeleteLogicFunctionAction,
  type FlatUpdateLogicFunctionAction,
  type UniversalDeleteLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  type FlatCreateNavigationMenuItemAction,
  type FlatDeleteNavigationMenuItemAction,
  type FlatUpdateNavigationMenuItemAction,
  type UniversalDeleteNavigationMenuItemAction,
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
  type UniversalDeletePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type FlatCreatePageLayoutWidgetAction,
  type FlatDeletePageLayoutWidgetAction,
  type FlatUpdatePageLayoutWidgetAction,
  type UniversalDeletePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import {
  type FlatCreatePageLayoutAction,
  type FlatDeletePageLayoutAction,
  type FlatUpdatePageLayoutAction,
  type UniversalDeletePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  type FlatCreateRoleTargetAction,
  type FlatDeleteRoleTargetAction,
  type FlatUpdateRoleTargetAction,
  type UniversalDeleteRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  type FlatCreateRoleAction,
  type FlatDeleteRoleAction,
  type FlatUpdateRoleAction,
  type UniversalDeleteRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import {
  type FlatCreateRowLevelPermissionPredicateGroupAction,
  type FlatDeleteRowLevelPermissionPredicateGroupAction,
  type FlatUpdateRowLevelPermissionPredicateGroupAction,
  type UniversalDeleteRowLevelPermissionPredicateGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action.type';
import {
  type FlatCreateRowLevelPermissionPredicateAction,
  type FlatDeleteRowLevelPermissionPredicateAction,
  type FlatUpdateRowLevelPermissionPredicateAction,
  type UniversalDeleteRowLevelPermissionPredicateAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action.type';
import {
  type FlatCreateSkillAction,
  type FlatDeleteSkillAction,
  type FlatUpdateSkillAction,
  type UniversalDeleteSkillAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import {
  type FlatCreateViewFieldAction,
  type FlatDeleteViewFieldAction,
  type FlatUpdateViewFieldAction,
  type UniversalDeleteViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  type FlatCreateViewFilterGroupAction,
  type FlatDeleteViewFilterGroupAction,
  type FlatUpdateViewFilterGroupAction,
  type UniversalDeleteViewFilterGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import {
  type FlatCreateViewFilterAction,
  type FlatDeleteViewFilterAction,
  type FlatUpdateViewFilterAction,
  type UniversalDeleteViewFilterAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import {
  type FlatCreateViewGroupAction,
  type FlatDeleteViewGroupAction,
  type FlatUpdateViewGroupAction,
  type UniversalDeleteViewGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import {
  type FlatCreateViewAction,
  type FlatDeleteViewAction,
  type FlatUpdateViewAction,
  type UniversalDeleteViewAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import {
  type FlatCreateWebhookAction,
  type FlatDeleteWebhookAction,
  type FlatUpdateWebhookAction,
  type UniversalDeleteWebhookAction,
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
      create: FlatCreateViewAction;
      update: FlatUpdateViewAction;
      delete: UniversalDeleteViewAction;
    };
    flatActions: {
      create: FlatCreateViewAction;
      update: FlatUpdateViewAction;
      delete: FlatDeleteViewAction;
    };
    flatEntity: FlatView;
    universalFlatEntity: UniversalFlatEntityFrom<ViewEntity>;
    entity: MetadataEntity<'view'>;
  };
  viewField: {
    flatEntityMaps: FlatViewFieldMaps;
    universalActions: {
      create: FlatCreateViewFieldAction;
      update: FlatUpdateViewFieldAction;
      delete: UniversalDeleteViewFieldAction;
    };
    flatActions: {
      create: FlatCreateViewFieldAction;
      update: FlatUpdateViewFieldAction;
      delete: FlatDeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFieldEntity>;
    entity: MetadataEntity<'viewField'>;
  };
  viewGroup: {
    flatEntityMaps: FlatViewGroupMaps;
    universalActions: {
      create: FlatCreateViewGroupAction;
      update: FlatUpdateViewGroupAction;
      delete: UniversalDeleteViewGroupAction;
    };
    flatActions: {
      create: FlatCreateViewGroupAction;
      update: FlatUpdateViewGroupAction;
      delete: FlatDeleteViewGroupAction;
    };
    flatEntity: FlatViewGroup;
    universalFlatEntity: UniversalFlatEntityFrom<ViewGroupEntity>;
    entity: MetadataEntity<'viewGroup'>;
  };
  rowLevelPermissionPredicate: {
    flatEntityMaps: FlatRowLevelPermissionPredicateMaps;
    universalActions: {
      create: FlatCreateRowLevelPermissionPredicateAction;
      update: FlatUpdateRowLevelPermissionPredicateAction;
      delete: UniversalDeleteRowLevelPermissionPredicateAction;
    };
    flatActions: {
      create: FlatCreateRowLevelPermissionPredicateAction;
      update: FlatUpdateRowLevelPermissionPredicateAction;
      delete: FlatDeleteRowLevelPermissionPredicateAction;
    };
    flatEntity: FlatRowLevelPermissionPredicate;
    universalFlatEntity: UniversalFlatEntityFrom<RowLevelPermissionPredicateEntity>;
    entity: MetadataEntity<'rowLevelPermissionPredicate'>;
  };
  rowLevelPermissionPredicateGroup: {
    flatEntityMaps: FlatRowLevelPermissionPredicateGroupMaps;
    universalActions: {
      create: FlatCreateRowLevelPermissionPredicateGroupAction;
      update: FlatUpdateRowLevelPermissionPredicateGroupAction;
      delete: UniversalDeleteRowLevelPermissionPredicateGroupAction;
    };
    flatActions: {
      create: FlatCreateRowLevelPermissionPredicateGroupAction;
      update: FlatUpdateRowLevelPermissionPredicateGroupAction;
      delete: FlatDeleteRowLevelPermissionPredicateGroupAction;
    };
    flatEntity: FlatRowLevelPermissionPredicateGroup;
    universalFlatEntity: UniversalFlatEntityFrom<RowLevelPermissionPredicateGroupEntity>;
    entity: MetadataEntity<'rowLevelPermissionPredicateGroup'>;
  };
  viewFilterGroup: {
    flatEntityMaps: FlatViewFilterGroupMaps;
    universalActions: {
      create: FlatCreateViewFilterGroupAction;
      update: FlatUpdateViewFilterGroupAction;
      delete: UniversalDeleteViewFilterGroupAction;
    };
    flatActions: {
      create: FlatCreateViewFilterGroupAction;
      update: FlatUpdateViewFilterGroupAction;
      delete: FlatDeleteViewFilterGroupAction;
    };
    flatEntity: FlatViewFilterGroup;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFilterGroupEntity>;
    entity: MetadataEntity<'viewFilterGroup'>;
  };
  index: {
    flatEntityMaps: FlatEntityMaps<FlatIndexMetadata>;
    universalActions: {
      create: FlatCreateIndexAction;
      update: FlatUpdateIndexAction;
      delete: UniversalDeleteIndexAction;
    };
    flatActions: {
      create: FlatCreateIndexAction;
      update: FlatUpdateIndexAction;
      delete: FlatDeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    universalFlatEntity: UniversalFlatEntityFrom<IndexMetadataEntity>;
    entity: MetadataEntity<'index'>;
  };
  logicFunction: {
    flatEntityMaps: FlatEntityMaps<FlatLogicFunction>;
    universalActions: {
      create: FlatCreateLogicFunctionAction;
      update: FlatUpdateLogicFunctionAction;
      delete: UniversalDeleteLogicFunctionAction;
    };
    flatActions: {
      create: FlatCreateLogicFunctionAction;
      update: FlatUpdateLogicFunctionAction;
      delete: FlatDeleteLogicFunctionAction;
    };
    flatEntity: FlatLogicFunction;
    universalFlatEntity: UniversalFlatEntityFrom<LogicFunctionEntity>;
    entity: MetadataEntity<'logicFunction'>;
  };
  viewFilter: {
    flatEntityMaps: FlatViewFilterMaps;
    universalActions: {
      create: FlatCreateViewFilterAction;
      update: FlatUpdateViewFilterAction;
      delete: UniversalDeleteViewFilterAction;
    };
    flatActions: {
      create: FlatCreateViewFilterAction;
      update: FlatUpdateViewFilterAction;
      delete: FlatDeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFilterEntity>;
    entity: MetadataEntity<'viewFilter'>;
  };
  role: {
    flatEntityMaps: FlatEntityMaps<FlatRole>;
    universalActions: {
      create: FlatCreateRoleAction;
      update: FlatUpdateRoleAction;
      delete: UniversalDeleteRoleAction;
    };
    flatActions: {
      create: FlatCreateRoleAction;
      update: FlatUpdateRoleAction;
      delete: FlatDeleteRoleAction;
    };
    flatEntity: FlatRole;
    universalFlatEntity: UniversalFlatEntityFrom<RoleEntity>;
    entity: MetadataEntity<'role'>;
  };
  roleTarget: {
    flatEntityMaps: FlatRoleTargetMaps;
    universalActions: {
      create: FlatCreateRoleTargetAction;
      update: FlatUpdateRoleTargetAction;
      delete: UniversalDeleteRoleTargetAction;
    };
    flatActions: {
      create: FlatCreateRoleTargetAction;
      update: FlatUpdateRoleTargetAction;
      delete: FlatDeleteRoleTargetAction;
    };
    flatEntity: FlatRoleTarget;
    universalFlatEntity: UniversalFlatEntityFrom<RoleTargetEntity>;
    entity: MetadataEntity<'roleTarget'>;
  };
  agent: {
    flatEntityMaps: FlatAgentMaps;
    universalActions: {
      create: FlatCreateAgentAction;
      update: FlatUpdateAgentAction;
      delete: UniversalDeleteAgentAction;
    };
    flatActions: {
      create: FlatCreateAgentAction;
      update: FlatUpdateAgentAction;
      delete: FlatDeleteAgentAction;
    };
    flatEntity: FlatAgent;
    universalFlatEntity: UniversalFlatEntityFrom<AgentEntity>;
    entity: MetadataEntity<'agent'>;
  };
  skill: {
    flatEntityMaps: FlatSkillMaps;
    universalActions: {
      create: FlatCreateSkillAction;
      update: FlatUpdateSkillAction;
      delete: UniversalDeleteSkillAction;
    };
    flatActions: {
      create: FlatCreateSkillAction;
      update: FlatUpdateSkillAction;
      delete: FlatDeleteSkillAction;
    };
    flatEntity: FlatSkill;
    universalFlatEntity: UniversalFlatEntityFrom<SkillEntity>;
    entity: MetadataEntity<'skill'>;
  };
  commandMenuItem: {
    flatEntityMaps: FlatCommandMenuItemMaps;
    universalActions: {
      create: FlatCreateCommandMenuItemAction;
      update: FlatUpdateCommandMenuItemAction;
      delete: UniversalDeleteCommandMenuItemAction;
    };
    flatActions: {
      create: FlatCreateCommandMenuItemAction;
      update: FlatUpdateCommandMenuItemAction;
      delete: FlatDeleteCommandMenuItemAction;
    };
    flatEntity: FlatCommandMenuItem;
    universalFlatEntity: UniversalFlatEntityFrom<CommandMenuItemEntity>;
    entity: MetadataEntity<'commandMenuItem'>;
  };
  navigationMenuItem: {
    flatEntityMaps: FlatNavigationMenuItemMaps;
    universalActions: {
      create: FlatCreateNavigationMenuItemAction;
      update: FlatUpdateNavigationMenuItemAction;
      delete: UniversalDeleteNavigationMenuItemAction;
    };
    flatActions: {
      create: FlatCreateNavigationMenuItemAction;
      update: FlatUpdateNavigationMenuItemAction;
      delete: FlatDeleteNavigationMenuItemAction;
    };
    flatEntity: FlatNavigationMenuItem;
    universalFlatEntity: UniversalFlatEntityFrom<NavigationMenuItemEntity>;
    entity: NavigationMenuItemEntity;
  };
  pageLayout: {
    flatEntityMaps: FlatPageLayoutMaps;
    universalActions: {
      create: FlatCreatePageLayoutAction;
      update: FlatUpdatePageLayoutAction;
      delete: UniversalDeletePageLayoutAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutAction;
      update: FlatUpdatePageLayoutAction;
      delete: FlatDeletePageLayoutAction;
    };
    flatEntity: FlatPageLayout;
    universalFlatEntity: UniversalFlatEntityFrom<PageLayoutEntity>;
    entity: MetadataEntity<'pageLayout'>;
  };
  pageLayoutWidget: {
    flatEntityMaps: FlatPageLayoutWidgetMaps;
    universalActions: {
      create: FlatCreatePageLayoutWidgetAction;
      update: FlatUpdatePageLayoutWidgetAction;
      delete: UniversalDeletePageLayoutWidgetAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutWidgetAction;
      update: FlatUpdatePageLayoutWidgetAction;
      delete: FlatDeletePageLayoutWidgetAction;
    };
    flatEntity: FlatPageLayoutWidget;
    universalFlatEntity: UniversalFlatEntityFrom<
      PageLayoutWidgetEntity,
      'pageLayoutWidget'
    >;
    entity: MetadataEntity<'pageLayoutWidget'>;
  };
  pageLayoutTab: {
    flatEntityMaps: FlatPageLayoutTabMaps;
    universalActions: {
      create: FlatCreatePageLayoutTabAction;
      update: FlatUpdatePageLayoutTabAction;
      delete: UniversalDeletePageLayoutTabAction;
    };
    flatActions: {
      create: FlatCreatePageLayoutTabAction;
      update: FlatUpdatePageLayoutTabAction;
      delete: FlatDeletePageLayoutTabAction;
    };
    flatEntity: FlatPageLayoutTab;
    universalFlatEntity: UniversalFlatEntityFrom<PageLayoutTabEntity>;
    entity: MetadataEntity<'pageLayoutTab'>;
  };
  frontComponent: {
    flatEntityMaps: FlatFrontComponentMaps;
    universalActions: {
      create: FlatCreateFrontComponentAction;
      update: FlatUpdateFrontComponentAction;
      delete: UniversalDeleteFrontComponentAction;
    };
    flatActions: {
      create: FlatCreateFrontComponentAction;
      update: FlatUpdateFrontComponentAction;
      delete: FlatDeleteFrontComponentAction;
    };
    flatEntity: FlatFrontComponent;
    universalFlatEntity: UniversalFlatEntityFrom<FrontComponentEntity>;
    entity: MetadataEntity<'frontComponent'>;
  };
  webhook: {
    flatEntityMaps: FlatWebhookMaps;
    universalActions: {
      create: FlatCreateWebhookAction;
      update: FlatUpdateWebhookAction;
      delete: UniversalDeleteWebhookAction;
    };
    flatActions: {
      create: FlatCreateWebhookAction;
      update: FlatUpdateWebhookAction;
      delete: FlatDeleteWebhookAction;
    };
    flatEntity: FlatWebhook;
    universalFlatEntity: UniversalFlatEntityFrom<WebhookEntity>;
    entity: MetadataEntity<'webhook'>;
  };
};
