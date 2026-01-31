import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
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
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
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
  type CreateAgentAction,
  type DeleteAgentAction,
  type UpdateAgentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  type CreateCommandMenuItemAction,
  type DeleteCommandMenuItemAction,
  type UpdateCommandMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import {
  type CreateFieldAction,
  type DeleteFieldAction,
  type FlatCreateFieldAction,
  type FlatDeleteFieldAction,
  type FlatUpdateFieldAction,
  type UpdateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import {
  type CreateFrontComponentAction,
  type DeleteFrontComponentAction,
  type UpdateFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  type CreateIndexAction,
  type DeleteIndexAction,
  type UpdateIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import {
  type CreateLogicFunctionAction,
  type DeleteLogicFunctionAction,
  type UpdateLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  type CreateNavigationMenuItemAction,
  type DeleteNavigationMenuItemAction,
  type UpdateNavigationMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/types/workspace-migration-navigation-menu-item-action.type';
import {
  type CreateObjectAction,
  type DeleteObjectAction,
  type FlatCreateObjectAction,
  type FlatDeleteObjectAction,
  type FlatUpdateObjectAction,
  type UpdateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import {
  type CreatePageLayoutTabAction,
  type DeletePageLayoutTabAction,
  type UpdatePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type CreatePageLayoutWidgetAction,
  type DeletePageLayoutWidgetAction,
  type UpdatePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import {
  type CreatePageLayoutAction,
  type DeletePageLayoutAction,
  type UpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  type CreateRoleTargetAction,
  type DeleteRoleTargetAction,
  type UpdateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  type CreateRoleAction,
  type DeleteRoleAction,
  type UpdateRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import {
  type CreateRowLevelPermissionPredicateGroupAction,
  type DeleteRowLevelPermissionPredicateGroupAction,
  type UpdateRowLevelPermissionPredicateGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action.type';
import {
  type CreateRowLevelPermissionPredicateAction,
  type DeleteRowLevelPermissionPredicateAction,
  type UpdateRowLevelPermissionPredicateAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action.type';
import {
  type CreateSkillAction,
  type DeleteSkillAction,
  type UpdateSkillAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import {
  type CreateViewFieldAction,
  type DeleteViewFieldAction,
  type UpdateViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  type CreateViewFilterGroupAction,
  type DeleteViewFilterGroupAction,
  type UpdateViewFilterGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import {
  type CreateViewFilterAction,
  type DeleteViewFilterAction,
  type UpdateViewFilterAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import {
  type CreateViewGroupAction,
  type DeleteViewGroupAction,
  type UpdateViewGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import {
  type CreateViewAction,
  type DeleteViewAction,
  type UpdateViewAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import {
  type CreateWebhookAction,
  type DeleteWebhookAction,
  type UpdateWebhookAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';

export type AllFlatEntityTypesByMetadataName = {
  fieldMetadata: {
    actions: {
      create: CreateFieldAction;
      update: UpdateFieldAction;
      delete: DeleteFieldAction;
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
    universalMigrated: {
      runner: true;
    };
  };
  objectMetadata: {
    actions: {
      create: CreateObjectAction;
      update: UpdateObjectAction;
      delete: DeleteObjectAction;
    };
    flatActions: {
      create: FlatCreateObjectAction;
      update: FlatUpdateObjectAction;
      delete: FlatDeleteObjectAction;
    };
    flatEntity: FlatObjectMetadata;
    universalFlatEntity: UniversalFlatObjectMetadata;
    entity: MetadataEntity<'objectMetadata'>;
    universalMigrated: {
      runner: true;
    };
  };
  view: {
    actions: {
      create: CreateViewAction;
      update: UpdateViewAction;
      delete: DeleteViewAction;
    };
    flatActions: {
      create: CreateViewAction;
      update: UpdateViewAction;
      delete: DeleteViewAction;
    };
    flatEntity: FlatView;
    universalFlatEntity: UniversalFlatEntityFrom<ViewEntity>;
    entity: MetadataEntity<'view'>;
  };
  viewField: {
    actions: {
      create: CreateViewFieldAction;
      update: UpdateViewFieldAction;
      delete: DeleteViewFieldAction;
    };
    flatActions: {
      create: CreateViewFieldAction;
      update: UpdateViewFieldAction;
      delete: DeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFieldEntity>;
    entity: MetadataEntity<'viewField'>;
  };
  viewGroup: {
    actions: {
      create: CreateViewGroupAction;
      update: UpdateViewGroupAction;
      delete: DeleteViewGroupAction;
    };
    flatActions: {
      create: CreateViewGroupAction;
      update: UpdateViewGroupAction;
      delete: DeleteViewGroupAction;
    };
    flatEntity: FlatViewGroup;
    universalFlatEntity: UniversalFlatEntityFrom<ViewGroupEntity>;
    entity: MetadataEntity<'viewGroup'>;
  };
  rowLevelPermissionPredicate: {
    actions: {
      create: CreateRowLevelPermissionPredicateAction;
      update: UpdateRowLevelPermissionPredicateAction;
      delete: DeleteRowLevelPermissionPredicateAction;
    };
    flatActions: {
      create: CreateRowLevelPermissionPredicateAction;
      update: UpdateRowLevelPermissionPredicateAction;
      delete: DeleteRowLevelPermissionPredicateAction;
    };
    flatEntity: FlatRowLevelPermissionPredicate;
    universalFlatEntity: UniversalFlatEntityFrom<RowLevelPermissionPredicateEntity>;
    entity: MetadataEntity<'rowLevelPermissionPredicate'>;
  };
  rowLevelPermissionPredicateGroup: {
    actions: {
      create: CreateRowLevelPermissionPredicateGroupAction;
      update: UpdateRowLevelPermissionPredicateGroupAction;
      delete: DeleteRowLevelPermissionPredicateGroupAction;
    };
    flatActions: {
      create: CreateRowLevelPermissionPredicateGroupAction;
      update: UpdateRowLevelPermissionPredicateGroupAction;
      delete: DeleteRowLevelPermissionPredicateGroupAction;
    };
    flatEntity: FlatRowLevelPermissionPredicateGroup;
    universalFlatEntity: UniversalFlatEntityFrom<RowLevelPermissionPredicateGroupEntity>;
    entity: MetadataEntity<'rowLevelPermissionPredicateGroup'>;
  };
  viewFilterGroup: {
    actions: {
      create: CreateViewFilterGroupAction;
      update: UpdateViewFilterGroupAction;
      delete: DeleteViewFilterGroupAction;
    };
    flatActions: {
      create: CreateViewFilterGroupAction;
      update: UpdateViewFilterGroupAction;
      delete: DeleteViewFilterGroupAction;
    };
    flatEntity: FlatViewFilterGroup;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFilterGroupEntity>;
    entity: MetadataEntity<'viewFilterGroup'>;
  };
  index: {
    actions: {
      create: CreateIndexAction;
      update: UpdateIndexAction;
      delete: DeleteIndexAction;
    };
    flatActions: {
      create: CreateIndexAction;
      update: UpdateIndexAction;
      delete: DeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    universalFlatEntity: UniversalFlatEntityFrom<IndexMetadataEntity>;
    entity: MetadataEntity<'index'>;
  };
  logicFunction: {
    actions: {
      create: CreateLogicFunctionAction;
      update: UpdateLogicFunctionAction;
      delete: DeleteLogicFunctionAction;
    };
    flatActions: {
      create: CreateLogicFunctionAction;
      update: UpdateLogicFunctionAction;
      delete: DeleteLogicFunctionAction;
    };
    flatEntity: FlatLogicFunction;
    universalFlatEntity: UniversalFlatEntityFrom<LogicFunctionEntity>;
    entity: MetadataEntity<'logicFunction'>;
  };
  viewFilter: {
    actions: {
      create: CreateViewFilterAction;
      update: UpdateViewFilterAction;
      delete: DeleteViewFilterAction;
    };
    flatActions: {
      create: CreateViewFilterAction;
      update: UpdateViewFilterAction;
      delete: DeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    universalFlatEntity: UniversalFlatEntityFrom<ViewFilterEntity>;
    entity: MetadataEntity<'viewFilter'>;
  };
  role: {
    actions: {
      create: CreateRoleAction;
      update: UpdateRoleAction;
      delete: DeleteRoleAction;
    };
    flatActions: {
      create: CreateRoleAction;
      update: UpdateRoleAction;
      delete: DeleteRoleAction;
    };
    flatEntity: FlatRole;
    universalFlatEntity: UniversalFlatEntityFrom<RoleEntity>;
    entity: MetadataEntity<'role'>;
  };
  roleTarget: {
    actions: {
      create: CreateRoleTargetAction;
      update: UpdateRoleTargetAction;
      delete: DeleteRoleTargetAction;
    };
    flatActions: {
      create: CreateRoleTargetAction;
      update: UpdateRoleTargetAction;
      delete: DeleteRoleTargetAction;
    };
    flatEntity: FlatRoleTarget;
    universalFlatEntity: UniversalFlatEntityFrom<RoleTargetEntity>;
    entity: MetadataEntity<'roleTarget'>;
  };
  agent: {
    actions: {
      create: CreateAgentAction;
      update: UpdateAgentAction;
      delete: DeleteAgentAction;
    };
    flatActions: {
      create: CreateAgentAction;
      update: UpdateAgentAction;
      delete: DeleteAgentAction;
    };
    flatEntity: FlatAgent;
    universalFlatEntity: UniversalFlatEntityFrom<AgentEntity>;
    entity: MetadataEntity<'agent'>;
  };
  skill: {
    actions: {
      create: CreateSkillAction;
      update: UpdateSkillAction;
      delete: DeleteSkillAction;
    };
    flatActions: {
      create: CreateSkillAction;
      update: UpdateSkillAction;
      delete: DeleteSkillAction;
    };
    flatEntity: FlatSkill;
    universalFlatEntity: UniversalFlatEntityFrom<SkillEntity>;
    entity: MetadataEntity<'skill'>;
  };
  commandMenuItem: {
    actions: {
      create: CreateCommandMenuItemAction;
      update: UpdateCommandMenuItemAction;
      delete: DeleteCommandMenuItemAction;
    };
    flatActions: {
      create: CreateCommandMenuItemAction;
      update: UpdateCommandMenuItemAction;
      delete: DeleteCommandMenuItemAction;
    };
    flatEntity: FlatCommandMenuItem;
    universalFlatEntity: UniversalFlatEntityFrom<CommandMenuItemEntity>;
    entity: MetadataEntity<'commandMenuItem'>;
  };
  navigationMenuItem: {
    actions: {
      create: CreateNavigationMenuItemAction;
      update: UpdateNavigationMenuItemAction;
      delete: DeleteNavigationMenuItemAction;
    };
    flatActions: {
      create: CreateNavigationMenuItemAction;
      update: UpdateNavigationMenuItemAction;
      delete: DeleteNavigationMenuItemAction;
    };
    flatEntity: FlatNavigationMenuItem;
    universalFlatEntity: UniversalFlatEntityFrom<NavigationMenuItemEntity>;
    entity: NavigationMenuItemEntity;
  };
  pageLayout: {
    actions: {
      create: CreatePageLayoutAction;
      update: UpdatePageLayoutAction;
      delete: DeletePageLayoutAction;
    };
    flatActions: {
      create: CreatePageLayoutAction;
      update: UpdatePageLayoutAction;
      delete: DeletePageLayoutAction;
    };
    flatEntity: FlatPageLayout;
    universalFlatEntity: UniversalFlatEntityFrom<PageLayoutEntity>;
    entity: MetadataEntity<'pageLayout'>;
  };
  pageLayoutWidget: {
    actions: {
      create: CreatePageLayoutWidgetAction;
      update: UpdatePageLayoutWidgetAction;
      delete: DeletePageLayoutWidgetAction;
    };
    flatActions: {
      create: CreatePageLayoutWidgetAction;
      update: UpdatePageLayoutWidgetAction;
      delete: DeletePageLayoutWidgetAction;
    };
    flatEntity: FlatPageLayoutWidget;
    universalFlatEntity: UniversalFlatEntityFrom<
      PageLayoutWidgetEntity,
      'pageLayoutWidget'
    >;
    entity: MetadataEntity<'pageLayoutWidget'>;
  };
  pageLayoutTab: {
    actions: {
      create: CreatePageLayoutTabAction;
      update: UpdatePageLayoutTabAction;
      delete: DeletePageLayoutTabAction;
    };
    flatActions: {
      create: CreatePageLayoutTabAction;
      update: UpdatePageLayoutTabAction;
      delete: DeletePageLayoutTabAction;
    };
    flatEntity: FlatPageLayoutTab;
    universalFlatEntity: UniversalFlatEntityFrom<PageLayoutTabEntity>;
    entity: MetadataEntity<'pageLayoutTab'>;
  };
  frontComponent: {
    actions: {
      create: CreateFrontComponentAction;
      update: UpdateFrontComponentAction;
      delete: DeleteFrontComponentAction;
    };
    flatActions: {
      create: CreateFrontComponentAction;
      update: UpdateFrontComponentAction;
      delete: DeleteFrontComponentAction;
    };
    flatEntity: FlatFrontComponent;
    universalFlatEntity: UniversalFlatEntityFrom<FrontComponentEntity>;
    entity: MetadataEntity<'frontComponent'>;
  };
  webhook: {
    actions: {
      create: CreateWebhookAction;
      update: UpdateWebhookAction;
      delete: DeleteWebhookAction;
    };
    flatActions: {
      create: CreateWebhookAction;
      update: UpdateWebhookAction;
      delete: DeleteWebhookAction;
    };
    flatEntity: FlatWebhook;
    universalFlatEntity: UniversalFlatEntityFrom<WebhookEntity>;
    entity: MetadataEntity<'webhook'>;
  };
};
