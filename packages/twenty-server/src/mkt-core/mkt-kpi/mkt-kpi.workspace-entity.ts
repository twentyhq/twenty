import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MKT_KPI_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { MktKpiHistoryWorkspaceEntity } from 'src/mkt-core/mkt-kpi-history/mkt-kpi-history.workspace-entity';

import {
  MKT_KPI_TYPE_OPTIONS,
  MKT_KPI_CATEGORY_OPTIONS,
  MKT_KPI_UNIT_OPTIONS,
  MKT_KPI_PERIOD_TYPE_OPTIONS,
  MKT_KPI_ASSIGNEE_TYPE_OPTIONS,
  MKT_KPI_STATUS_OPTIONS,
  MKT_KPI_PRIORITY_OPTIONS,
} from './constants/mkt-kpi-options';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktKpi,
  namePlural: 'mktKpis',
  labelSingular: msg`KPI`,
  labelPlural: msg`KPIs`,
  description: msg`Key Performance Indicators for tracking business metrics`,
  icon: 'IconTarget',
  shortcut: 'K',
})
@WorkspaceIsSearchable()
export class MktKpiWorkspaceEntity extends BaseWorkspaceEntity {
  // === BASIC KPI INFORMATION ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.kpiName,
    type: FieldMetadataType.TEXT,
    label: msg`KPI Name`,
    description: msg`Display name of the KPI`,
    icon: 'IconTag',
  })
  kpiName: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.kpiCode,
    type: FieldMetadataType.TEXT,
    label: msg`KPI Code`,
    description: msg`Unique KPI code for reference and automation`,
    icon: 'IconCode',
  })
  kpiCode: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.kpiType,
    type: FieldMetadataType.SELECT,
    label: msg`KPI Type`,
    description: msg`Type of KPI metric`,
    icon: 'IconCategory',
    options: MKT_KPI_TYPE_OPTIONS,
    defaultValue: "'REVENUE'",
  })
  kpiType: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.kpiCategory,
    type: FieldMetadataType.SELECT,
    label: msg`KPI Category`,
    description: msg`Business category of the KPI`,
    icon: 'IconFolders',
    options: MKT_KPI_CATEGORY_OPTIONS,
    defaultValue: "'SALES'",
  })
  kpiCategory: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of the KPI`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  // === TARGET AND ACTUAL VALUES ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.targetValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Target Value`,
    description: msg`Target value to achieve`,
    icon: 'IconTarget',
  })
  targetValue: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.actualValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Actual Value`,
    description: msg`Current actual value achieved`,
    icon: 'IconTrendingUp',
  })
  actualValue: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.SELECT,
    label: msg`Unit of Measure`,
    description: msg`Unit for measuring the KPI value`,
    icon: 'IconRuler',
    options: MKT_KPI_UNIT_OPTIONS,
    defaultValue: "'VND'",
  })
  @WorkspaceIsNullable()
  unitOfMeasure?: string;

  // === TIME PERIOD ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodType,
    type: FieldMetadataType.SELECT,
    label: msg`Period Type`,
    description: msg`Time period for measuring the KPI`,
    icon: 'IconCalendar',
    options: MKT_KPI_PERIOD_TYPE_OPTIONS,
    defaultValue: "'MONTHLY'",
  })
  periodType: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodYear,
    type: FieldMetadataType.NUMBER,
    label: msg`Period Year`,
    description: msg`Year for the KPI period`,
    icon: 'IconCalendarEvent',
  })
  periodYear: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodQuarter,
    type: FieldMetadataType.NUMBER,
    label: msg`Period Quarter`,
    description: msg`Quarter in year (1-4)`,
    icon: 'IconCalendarTime',
  })
  @WorkspaceIsNullable()
  periodQuarter?: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodMonth,
    type: FieldMetadataType.NUMBER,
    label: msg`Period Month`,
    description: msg`Month in year (1-12)`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  periodMonth?: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodWeek,
    type: FieldMetadataType.NUMBER,
    label: msg`Period Week`,
    description: msg`Week in year (1-53)`,
    icon: 'IconCalendarWeek',
  })
  @WorkspaceIsNullable()
  periodWeek?: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodStartDate,
    type: FieldMetadataType.DATE,
    label: msg`Period Start Date`,
    description: msg`Start date of the KPI period`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  periodStartDate?: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.periodEndDate,
    type: FieldMetadataType.DATE,
    label: msg`Period End Date`,
    description: msg`End date of the KPI period`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  periodEndDate?: string;

  // === ASSIGNMENT ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.assigneeType,
    type: FieldMetadataType.SELECT,
    label: msg`Assignee Type`,
    description: msg`Type of assignee for this KPI`,
    icon: 'IconUsers',
    options: MKT_KPI_ASSIGNEE_TYPE_OPTIONS,
    defaultValue: "'INDIVIDUAL'",
  })
  assigneeType: string;

  // === STATUS AND PROGRESS ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the KPI`,
    icon: 'IconProgressCheck',
    options: MKT_KPI_STATUS_OPTIONS,
    defaultValue: "'IN_PROGRESS'",
  })
  status: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.achievedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Achieved At`,
    description: msg`Date and time when KPI was achieved`,
    icon: 'IconCalendarCheck',
  })
  @WorkspaceIsNullable()
  achievedAt?: string;

  // === CALCULATION CONFIGURATION ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.isAutoCalculated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Auto Calculated`,
    description: msg`Whether the KPI is automatically calculated`,
    icon: 'IconRobot',
  })
  @WorkspaceIsNullable()
  isAutoCalculated?: boolean;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.calculationFormula,
    type: FieldMetadataType.TEXT,
    label: msg`Calculation Formula`,
    description: msg`Formula for automatic calculation`,
    icon: 'IconMath',
  })
  @WorkspaceIsNullable()
  calculationFormula?: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.alertThresholds,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Alert Thresholds`,
    description: msg`Threshold configuration for alerts`,
    icon: 'IconBell',
  })
  @WorkspaceIsNullable()
  alertThresholds?: object;

  // === ADDITIONAL INFORMATION ===
  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Additional notes or comments`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  notes?: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.priority,
    type: FieldMetadataType.SELECT,
    label: msg`Priority`,
    description: msg`Priority level of the KPI`,
    icon: 'IconFlag',
    options: MKT_KPI_PRIORITY_OPTIONS,
    defaultValue: "'MEDIUM'",
  })
  @WorkspaceIsNullable()
  priority?: string;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.weight,
    type: FieldMetadataType.NUMBER,
    label: msg`Weight`,
    description: msg`Weight of this KPI in overall calculations`,
    icon: 'IconWeight',
  })
  @WorkspaceIsNullable()
  weight?: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_KPI_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_KPI_FIELD_IDS.createdByPerson,
    type: RelationType.MANY_TO_ONE,
    label: msg`Created by Person`,
    description: msg`Person who created this KPI`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'createdKpis',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  createdByPerson: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('createdByPerson')
  createdByPersonId: string | null;

  @WorkspaceRelation({
    standardId: MKT_KPI_FIELD_IDS.kpiHistories,
    type: RelationType.ONE_TO_MANY,
    label: msg`KPI Histories`,
    description: msg`History of changes made to this KPI`,
    icon: 'IconHistory',
    inverseSideTarget: () => MktKpiHistoryWorkspaceEntity,
    inverseSideFieldKey: 'kpi',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  kpiHistories: Relation<MktKpiHistoryWorkspaceEntity[]>;

  // @WorkspaceRelation({
  //   standardId: MKT_KPI_FIELD_IDS.assigneeWorkspaceMember,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Assignee (Person)`,
  //   description: msg`Person assigned to this KPI`,
  //   icon: 'IconUser',
  //   inverseSideTarget: () => PersonWorkspaceEntity,
  //   inverseSideFieldKey: 'assignedKpis',
  // })
  // @WorkspaceIsNullable()
  // assigneeWorkspaceMember: Relation<PersonWorkspaceEntity> | null;
  //
  // @WorkspaceRelation({
  //   standardId: MKT_KPI_FIELD_IDS.assigneeDepartment,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Assignee (Department)`,
  //   description: msg`Department assigned to this KPI`,
  //   icon: 'IconBuilding',
  //   inverseSideTarget: () => MktDepartmentWorkspaceEntity,
  //   inverseSideFieldKey: 'assignedKpis',
  // })
  // @WorkspaceIsNullable()
  // assigneeDepartment: Relation<MktDepartmentWorkspaceEntity> | null;
}
