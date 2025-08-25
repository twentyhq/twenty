import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_KPI_TEMPLATE_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import {
  MKT_KPI_TEMPLATE_TARGET_ROLE_OPTIONS,
  MKT_KPI_TYPE_OPTIONS,
  MKT_KPI_CATEGORY_OPTIONS,
  MKT_KPI_UNIT_OPTIONS,
  MKT_KPI_PERIOD_TYPE_OPTIONS,
  MKT_KPI_PRIORITY_OPTIONS,
} from './constants/mkt-kpi-template-options';

const SEARCH_FIELDS_FOR_KPI_TEMPLATE: FieldTypeAndNameMetadata[] = [
  { name: 'templateName', type: FieldMetadataType.TEXT },
  { name: 'templateCode', type: FieldMetadataType.TEXT },
  { name: 'description', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktKpiTemplate,
  namePlural: 'mktKpiTemplates',
  labelSingular: msg`KPI Template`,
  labelPlural: msg`KPI Templates`,
  description: msg`Templates for creating standardized KPIs`,
  icon: 'IconTemplate',
  shortcut: 'T',
  labelIdentifierStandardId: MKT_KPI_TEMPLATE_FIELD_IDS.templateName,
})
@WorkspaceIsSearchable()
export class MktKpiTemplateWorkspaceEntity extends BaseWorkspaceEntity {
  // === BASIC TEMPLATE INFORMATION ===
  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.templateName,
    type: FieldMetadataType.TEXT,
    label: msg`Template Name`,
    description: msg`Display name of the KPI template`,
    icon: 'IconTag',
  })
  templateName: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.templateCode,
    type: FieldMetadataType.TEXT,
    label: msg`Template Code`,
    description: msg`Unique template code for reference`,
    icon: 'IconCode',
  })
  templateCode: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of the template`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  // === TARGET APPLICATION ===
  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.targetRole,
    type: FieldMetadataType.SELECT,
    label: msg`Target Role`,
    description: msg`Job role this template applies to`,
    icon: 'IconUser',
    options: MKT_KPI_TEMPLATE_TARGET_ROLE_OPTIONS,
    defaultValue: "'GENERAL'",
  })
  @WorkspaceIsNullable()
  targetRole?: string;

  // === DEFAULT KPI CONFIGURATION ===
  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.kpiType,
    type: FieldMetadataType.SELECT,
    label: msg`KPI Type`,
    description: msg`Default KPI type for this template`,
    icon: 'IconCategory',
    options: MKT_KPI_TYPE_OPTIONS,
    defaultValue: "'REVENUE'",
  })
  kpiType: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.kpiCategory,
    type: FieldMetadataType.SELECT,
    label: msg`KPI Category`,
    description: msg`Default business category`,
    icon: 'IconFolders',
    options: MKT_KPI_CATEGORY_OPTIONS,
    defaultValue: "'SALES'",
  })
  kpiCategory: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.SELECT,
    label: msg`Unit of Measure`,
    description: msg`Default unit for measuring values`,
    icon: 'IconRuler',
    options: MKT_KPI_UNIT_OPTIONS,
    defaultValue: "'VND'",
  })
  @WorkspaceIsNullable()
  unitOfMeasure?: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.defaultTargetValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Default Target Value`,
    description: msg`Default target value when creating KPIs from this template`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  defaultTargetValue?: number;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.periodType,
    type: FieldMetadataType.SELECT,
    label: msg`Period Type`,
    description: msg`Default time period for KPIs`,
    icon: 'IconCalendar',
    options: MKT_KPI_PERIOD_TYPE_OPTIONS,
    defaultValue: "'MONTHLY'",
  })
  periodType: string;

  // === CALCULATION CONFIGURATION ===
  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.isAutoCalculated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Auto Calculated`,
    description: msg`Whether KPIs from this template are automatically calculated`,
    icon: 'IconRobot',
  })
  @WorkspaceIsNullable()
  isAutoCalculated?: boolean;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.calculationFormula,
    type: FieldMetadataType.TEXT,
    label: msg`Calculation Formula`,
    description: msg`Default formula for automatic calculation`,
    icon: 'IconMath',
  })
  @WorkspaceIsNullable()
  calculationFormula?: string;

  // === TEMPLATE CONFIGURATION ===
  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this template is currently active`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.isDefault,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Default`,
    description: msg`Whether this is the default template for the target role`,
    icon: 'IconStar',
  })
  @WorkspaceIsNullable()
  isDefault?: boolean;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.priority,
    type: FieldMetadataType.SELECT,
    label: msg`Priority`,
    description: msg`Default priority level for KPIs`,
    icon: 'IconFlag',
    options: MKT_KPI_PRIORITY_OPTIONS,
    defaultValue: "'MEDIUM'",
  })
  @WorkspaceIsNullable()
  priority?: string;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.weight,
    type: FieldMetadataType.NUMBER,
    label: msg`Weight`,
    description: msg`Default weight for KPIs in calculations`,
    icon: 'IconWeight',
  })
  @WorkspaceIsNullable()
  weight?: number;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.templateConfig,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Template Configuration`,
    description: msg`Advanced template configuration in JSON format`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  templateConfig?: object;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.assignedTo,
    type: RelationType.MANY_TO_ONE,
    label: msg`Created by Person`,
    description: msg`Person who created this KPI`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'createdKpiTemplates',
  })
  @WorkspaceIsNullable()
  assignedTo: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('assignedTo')
  assignedToId: string | null;

  @WorkspaceField({
    standardId: MKT_KPI_TEMPLATE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_KPI_TEMPLATE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
