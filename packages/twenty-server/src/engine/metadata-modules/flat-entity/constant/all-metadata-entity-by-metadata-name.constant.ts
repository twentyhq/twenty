import { type AllMetadataName } from 'twenty-shared/metadata';
import { type EntityTarget, type ObjectLiteral } from 'typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const ALL_METADATA_ENTITY_BY_METADATA_NAME = {
  viewField: ViewFieldEntity,
  viewFieldGroup: ViewFieldGroupEntity,
  viewFilter: ViewFilterEntity,
  viewGroup: ViewGroupEntity,
  viewFilterGroup: ViewFilterGroupEntity,
  roleTarget: RoleTargetEntity,
  rowLevelPermissionPredicate: RowLevelPermissionPredicateEntity,
  pageLayoutWidget: PageLayoutWidgetEntity,
  rowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroupEntity,
  view: ViewEntity,
  index: IndexMetadataEntity,
  pageLayoutTab: PageLayoutTabEntity,
  frontComponent: FrontComponentEntity,
  fieldMetadata: FieldMetadataEntity,
  pageLayout: PageLayoutEntity,
  skill: SkillEntity,
  logicFunction: LogicFunctionEntity,
  objectMetadata: ObjectMetadataEntity,
  role: RoleEntity,
  agent: AgentEntity,
  commandMenuItem: CommandMenuItemEntity,
  navigationMenuItem: NavigationMenuItemEntity,
  webhook: WebhookEntity,
} as const satisfies Record<AllMetadataName, EntityTarget<ObjectLiteral>>;
