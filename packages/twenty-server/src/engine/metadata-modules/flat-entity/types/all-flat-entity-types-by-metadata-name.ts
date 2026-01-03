import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
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
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  type CreateAgentAction,
  type DeleteAgentAction,
  type UpdateAgentAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-v2-agent-action-builder.service';
import {
  type CreateCronTriggerAction,
  type DeleteCronTriggerAction,
  type UpdateCronTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import {
  type CreateDatabaseEventTriggerAction,
  type DeleteDatabaseEventTriggerAction,
  type UpdateDatabaseEventTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import {
  type CreateFieldAction,
  type DeleteFieldAction,
  type UpdateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import {
  type CreateIndexAction,
  type DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/types/workspace-migration-index-action-v2';
import {
  type CreateObjectAction,
  type DeleteObjectAction,
  type UpdateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import {
  type CreatePageLayoutTabAction,
  type DeletePageLayoutTabAction,
  type UpdatePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import {
  type CreatePageLayoutWidgetAction,
  type DeletePageLayoutWidgetAction,
  type UpdatePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import {
  type CreatePageLayoutAction,
  type DeletePageLayoutAction,
  type UpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout/types/workspace-migration-page-layout-action-v2.type';
import {
  type CreateRoleTargetAction,
  type DeleteRoleTargetAction,
  type UpdateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import {
  type CreateRoleAction,
  type DeleteRoleAction,
  type UpdateRoleAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/types/workspace-migration-role-action-v2.type';
import {
  type CreateRouteTriggerAction,
  type DeleteRouteTriggerAction,
  type UpdateRouteTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import {
  type CreateRowLevelPermissionPredicateGroupAction,
  type DeleteRowLevelPermissionPredicateGroupAction,
  type UpdateRowLevelPermissionPredicateGroupAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action-v2.type';
import {
  type CreateRowLevelPermissionPredicateAction,
  type DeleteRowLevelPermissionPredicateAction,
  type UpdateRowLevelPermissionPredicateAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action-v2.type';
import {
  type CreateServerlessFunctionAction,
  type DeleteServerlessFunctionAction,
  type UpdateServerlessFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import {
  type CreateSkillAction,
  type DeleteSkillAction,
  type UpdateSkillAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/skill/types/workspace-migration-v2-skill-action.type';
import {
  type CreateViewFieldAction,
  type DeleteViewFieldAction,
  type UpdateViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import {
  type CreateViewFilterGroupAction,
  type DeleteViewFilterGroupAction,
  type UpdateViewFilterGroupAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import {
  type CreateViewFilterAction,
  type DeleteViewFilterAction,
  type UpdateViewFilterAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import {
  type CreateViewGroupAction,
  type DeleteViewGroupAction,
  type UpdateViewGroupAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/types/workspace-migration-view-group-action-v2.type';
import {
  type CreateViewAction,
  type DeleteViewAction,
  type UpdateViewAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';

export type AllFlatEntityTypesByMetadataName = {
  fieldMetadata: {
    actions: {
      created: CreateFieldAction;
      updated: UpdateFieldAction;
      deleted: DeleteFieldAction;
    };
    flatEntity: FlatFieldMetadata;
    entity: FieldMetadataEntity;
  };
  objectMetadata: {
    actions: {
      created: CreateObjectAction;
      updated: UpdateObjectAction;
      deleted: DeleteObjectAction;
    };
    flatEntity: FlatObjectMetadata;
    entity: ObjectMetadataEntity;
  };
  view: {
    actions: {
      created: CreateViewAction;
      updated: UpdateViewAction;
      deleted: DeleteViewAction;
    };
    flatEntity: FlatView;
    entity: ViewEntity;
  };
  viewField: {
    actions: {
      created: CreateViewFieldAction;
      updated: UpdateViewFieldAction;
      deleted: DeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    entity: ViewFieldEntity;
  };
  viewGroup: {
    actions: {
      created: CreateViewGroupAction;
      updated: UpdateViewGroupAction;
      deleted: DeleteViewGroupAction;
    };
    flatEntity: FlatViewGroup;
    entity: ViewGroupEntity;
  };
  rowLevelPermissionPredicate: {
    actions: {
      created: CreateRowLevelPermissionPredicateAction;
      updated: UpdateRowLevelPermissionPredicateAction;
      deleted: DeleteRowLevelPermissionPredicateAction;
    };
    flatEntity: FlatRowLevelPermissionPredicate;
    entity: RowLevelPermissionPredicateEntity;
  };
  rowLevelPermissionPredicateGroup: {
    actions: {
      created: CreateRowLevelPermissionPredicateGroupAction;
      updated: UpdateRowLevelPermissionPredicateGroupAction;
      deleted: DeleteRowLevelPermissionPredicateGroupAction;
    };
    flatEntity: FlatRowLevelPermissionPredicateGroup;
    entity: RowLevelPermissionPredicateGroupEntity;
  };
  viewFilterGroup: {
    actions: {
      created: CreateViewFilterGroupAction;
      updated: UpdateViewFilterGroupAction;
      deleted: DeleteViewFilterGroupAction;
    };
    flatEntity: FlatViewFilterGroup;
    entity: ViewFilterGroupEntity;
  };
  index: {
    actions: {
      created: CreateIndexAction;
      updated: [DeleteIndexAction, CreateIndexAction];
      deleted: DeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    entity: IndexMetadataEntity;
  };
  serverlessFunction: {
    actions: {
      created: CreateServerlessFunctionAction;
      updated: UpdateServerlessFunctionAction;
      deleted: DeleteServerlessFunctionAction;
    };
    flatEntity: FlatServerlessFunction;
    entity: ServerlessFunctionEntity;
  };
  cronTrigger: {
    actions: {
      created: CreateCronTriggerAction;
      updated: UpdateCronTriggerAction;
      deleted: DeleteCronTriggerAction;
    };
    flatEntity: FlatCronTrigger;
    entity: CronTriggerEntity;
  };
  databaseEventTrigger: {
    actions: {
      created: CreateDatabaseEventTriggerAction;
      updated: UpdateDatabaseEventTriggerAction;
      deleted: DeleteDatabaseEventTriggerAction;
    };
    flatEntity: FlatDatabaseEventTrigger;
    entity: DatabaseEventTriggerEntity;
  };
  routeTrigger: {
    actions: {
      created: CreateRouteTriggerAction;
      updated: UpdateRouteTriggerAction;
      deleted: DeleteRouteTriggerAction;
    };
    flatEntity: FlatRouteTrigger;
    entity: RouteTriggerEntity;
  };
  viewFilter: {
    actions: {
      created: CreateViewFilterAction;
      updated: UpdateViewFilterAction;
      deleted: DeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    entity: ViewFilterEntity;
  };
  role: {
    actions: {
      created: CreateRoleAction;
      updated: UpdateRoleAction;
      deleted: DeleteRoleAction;
    };
    flatEntity: FlatRole;
    entity: RoleEntity;
  };
  roleTarget: {
    actions: {
      created: CreateRoleTargetAction;
      updated: UpdateRoleTargetAction;
      deleted: DeleteRoleTargetAction;
    };
    flatEntity: FlatRoleTarget;
    entity: RoleTargetEntity;
  };
  agent: {
    actions: {
      created: CreateAgentAction;
      updated: UpdateAgentAction;
      deleted: DeleteAgentAction;
    };
    flatEntity: FlatAgent;
    entity: AgentEntity;
  };
  skill: {
    actions: {
      created: CreateSkillAction;
      updated: UpdateSkillAction;
      deleted: DeleteSkillAction;
    };
    flatEntity: FlatSkill;
    entity: SkillEntity;
  };
  pageLayout: {
    actions: {
      created: CreatePageLayoutAction;
      updated: UpdatePageLayoutAction;
      deleted: DeletePageLayoutAction;
    };
    flatEntity: FlatPageLayout;
    entity: PageLayoutEntity;
  };
  pageLayoutWidget: {
    actions: {
      created: CreatePageLayoutWidgetAction;
      updated: UpdatePageLayoutWidgetAction;
      deleted: DeletePageLayoutWidgetAction;
    };
    flatEntity: FlatPageLayoutWidget;
    entity: PageLayoutWidgetEntity;
  };
  pageLayoutTab: {
    actions: {
      created: CreatePageLayoutTabAction;
      updated: UpdatePageLayoutTabAction;
      deleted: DeletePageLayoutTabAction;
    };
    flatEntity: FlatPageLayoutTab;
    entity: PageLayoutTabEntity;
  };
};
