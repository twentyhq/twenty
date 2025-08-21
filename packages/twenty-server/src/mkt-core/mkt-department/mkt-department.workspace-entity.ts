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
import { MKT_DEPARTMENT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktDepartment,
  namePlural: 'mktDepartments',
  labelSingular: msg`Department`,
  labelPlural: msg`Departments`,
  description: msg`Departments in the marketing system.`,
  icon: 'IconBuilding',
  shortcut: 'D',
})
@WorkspaceIsSearchable()
export class MktDepartmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.departmentCode,
    type: FieldMetadataType.TEXT,
    label: msg`Department Code`,
    description: msg`Unique department identifier`,
    icon: 'IconCode',
  })
  departmentCode: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.departmentName,
    type: FieldMetadataType.TEXT,
    label: msg`Department Name`,
    description: msg`Display name of the department`,
    icon: 'IconTag',
  })
  departmentName: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.departmentNameEn,
    type: FieldMetadataType.TEXT,
    label: msg`Department Name (English)`,
    description: msg`English name of the department`,
    icon: 'IconLanguage',
  })
  @WorkspaceIsNullable()
  departmentNameEn?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of the department`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.budgetCode,
    type: FieldMetadataType.TEXT,
    label: msg`Budget Code`,
    description: msg`Budget tracking code`,
    icon: 'IconCash',
  })
  @WorkspaceIsNullable()
  budgetCode?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.costCenter,
    type: FieldMetadataType.TEXT,
    label: msg`Cost Center`,
    description: msg`Cost allocation center`,
    icon: 'IconCalculator',
  })
  @WorkspaceIsNullable()
  costCenter?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.requiresKpiTracking,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Requires KPI Tracking`,
    description: msg`Whether KPI tracking is required`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  requiresKpiTracking?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.allowsCrossDepartmentAccess,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Allows Cross-Department Access`,
    description: msg`Whether cross-department access is allowed`,
    icon: 'IconExchange',
  })
  @WorkspaceIsNullable()
  allowsCrossDepartmentAccess?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.defaultKpiCategory,
    type: FieldMetadataType.TEXT,
    label: msg`Default KPI Category`,
    description: msg`Default KPI category for this department`,
    icon: 'IconCategory',
  })
  @WorkspaceIsNullable()
  defaultKpiCategory?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Order of display in department list`,
    icon: 'IconList',
  })
  displayOrder: number;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.colorCode,
    type: FieldMetadataType.TEXT,
    label: msg`Color Code`,
    description: msg`Color for UI display`,
    icon: 'IconPalette',
  })
  @WorkspaceIsNullable()
  colorCode?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.iconName,
    type: FieldMetadataType.TEXT,
    label: msg`Icon Name`,
    description: msg`Icon name for UI display`,
    icon: 'IconPhoto',
  })
  @WorkspaceIsNullable()
  iconName?: string;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this department is currently active`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_DEPARTMENT_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_DEPARTMENT_FIELD_IDS.staffMembers,
    type: RelationType.ONE_TO_MANY,
    label: msg`People`,
    description: msg`People in this department`,
    icon: 'IconUsers',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'department',
  })
  people: Relation<PersonWorkspaceEntity[]>;
}
