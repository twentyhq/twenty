import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MKT_DEPARTMENT_HIERARCHY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktDepartmentWorkspaceEntity } from 'src/mkt-core/mkt-department/mkt-department.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPE_OPTIONS } from 'src/mkt-core/mkt-department/constants/relationship-type.constants';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktDepartmentHierarchy,
  namePlural: 'mktDepartmentHierarchies',
  labelSingular: msg`Department Hierarchy`,
  labelPlural: msg`Department Hierarchies`,
  description: msg`Hierarchical relationships between departments in the marketing system.`,
  icon: 'IconHierarchy',
  shortcut: 'H',
})
@WorkspaceIsSearchable()
export class MktDepartmentHierarchyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.hierarchyLevel,
    type: FieldMetadataType.NUMBER,
    label: msg`Hierarchy Level`,
    description: msg`Level in the organizational hierarchy (0 = root, 1 = direct child, etc.)`,
    icon: 'IconLayers',
  })
  hierarchyLevel: number;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.relationshipType,
    type: FieldMetadataType.SELECT,
    label: msg`Relationship Type`,
    description: msg`Type of hierarchical relationship`,
    icon: 'IconLink',
    options: DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPE_OPTIONS,
  })
  relationshipType: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.validFrom,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Valid From`,
    description: msg`Start date of this hierarchical relationship`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  validFrom?: Date;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.validTo,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Valid To`,
    description: msg`End date of this hierarchical relationship`,
    icon: 'IconCalendarX',
  })
  @WorkspaceIsNullable()
  validTo?: Date;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.inheritsPermissions,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Inherits Permissions`,
    description: msg`Whether child department inherits permissions from parent`,
    icon: 'IconKey',
  })
  @WorkspaceIsNullable()
  inheritsPermissions?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canEscalateToParent,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Escalate to Parent`,
    description: msg`Whether issues can be escalated to parent department`,
    icon: 'IconArrowUp',
  })
  @WorkspaceIsNullable()
  canEscalateToParent?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.allowsCrossBranchAccess,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Allows Cross-Branch Access`,
    description: msg`Whether cross-branch department access is allowed`,
    icon: 'IconExchange',
  })
  @WorkspaceIsNullable()
  allowsCrossBranchAccess?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Order for displaying in hierarchy tree`,
    icon: 'IconList',
  })
  @WorkspaceIsNullable()
  displayOrder?: number;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Additional notes about this hierarchical relationship`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  notes?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this hierarchical relationship is currently active`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.parentDepartment,
    type: RelationType.MANY_TO_ONE,
    label: msg`Parent Department`,
    description: msg`Parent department in the hierarchy`,
    icon: 'IconBuilding',
    inverseSideTarget: () => MktDepartmentWorkspaceEntity,
    inverseSideFieldKey: 'childHierarchies',
  })
  @WorkspaceIsNullable()
  parentDepartment: Relation<MktDepartmentWorkspaceEntity>;

  @WorkspaceJoinColumn('parentDepartment')
  parentDepartmentId: string;

  @WorkspaceRelation({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.childDepartment,
    type: RelationType.MANY_TO_ONE,
    label: msg`Child Department`,
    description: msg`Child department in the hierarchy`,
    icon: 'IconBuilding',
    inverseSideTarget: () => MktDepartmentWorkspaceEntity,
    inverseSideFieldKey: 'parentHierarchies',
  })
  @WorkspaceIsNullable()
  childDepartment: Relation<MktDepartmentWorkspaceEntity>;

  @WorkspaceJoinColumn('childDepartment')
  childDepartmentId: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.hierarchyPath,
    type: FieldMetadataType.ARRAY,
    label: msg`Hierarchy Path`,
    description: msg`Array of department IDs from root to this node`,
    icon: 'IconRoute',
  })
  @WorkspaceIsNullable()
  hierarchyPath?: string[];

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.inheritsParentPermissions,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Inherits Parent Permissions`,
    description: msg`Whether this department inherits permissions from its parent`,
    icon: 'IconBarrierBlock',
  })
  @WorkspaceIsNullable()
  inheritsParentPermissions?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canViewTeamData,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can View Team Data`,
    description: msg`Manager can view data belonging to child departments`,
    icon: 'IconEye',
  })
  @WorkspaceIsNullable()
  canViewTeamData?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canEditTeamData,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Edit Team Data`,
    description: msg`Manager can edit data belonging to child departments`,
    icon: 'IconEdit',
  })
  @WorkspaceIsNullable()
  canEditTeamData?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canExportTeamData,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Export Team Data`,
    description: msg`Manager can export data belonging to child departments`,
    icon: 'IconDownload',
  })
  @WorkspaceIsNullable()
  canExportTeamData?: boolean;
}
