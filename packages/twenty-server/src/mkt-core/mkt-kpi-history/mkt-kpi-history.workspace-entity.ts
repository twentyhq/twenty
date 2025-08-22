import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
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
import { MktKpiWorkspaceEntity } from 'src/mkt-core/mkt-kpi/mkt-kpi.workspace-entity';
import { MKT_KPI_HISTORY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';

import {
  MKT_KPI_HISTORY_CHANGE_TYPE_OPTIONS,
  MKT_KPI_HISTORY_CHANGE_SOURCE_OPTIONS,
  MKT_KPI_HISTORY_CHANGE_TYPE,
} from './constants/mkt-kpi-history-options';

const SEARCH_FIELDS_FOR_KPI_HISTORY: FieldTypeAndNameMetadata[] = [
  { name: 'changeReason', type: FieldMetadataType.TEXT },
  { name: 'changeDescription', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktKpiHistory,
  namePlural: 'mktKpiHistories',
  labelSingular: msg`KPI History`,
  labelPlural: msg`KPI Histories`,
  description: msg`Track changes and updates to KPIs over time`,
  icon: 'IconHistory',
  shortcut: 'H',
})
@WorkspaceIsSearchable()
export class MktKpiHistoryWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.changeType,
    type: FieldMetadataType.SELECT,
    label: msg`Change Type`,
    description: msg`Type of change made to the KPI`,
    icon: 'IconEdit',
    options: MKT_KPI_HISTORY_CHANGE_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  changeType: MKT_KPI_HISTORY_CHANGE_TYPE;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.oldValue,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Old Value`,
    description: msg`Previous value before the change`,
    icon: 'IconArrowLeft',
  })
  @WorkspaceIsNullable()
  oldValue?: object;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.newValue,
    type: FieldMetadataType.RAW_JSON,
    label: msg`New Value`,
    description: msg`New value after the change`,
    icon: 'IconArrowRight',
  })
  @WorkspaceIsNullable()
  newValue?: object;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.changeReason,
    type: FieldMetadataType.TEXT,
    label: msg`Change Reason`,
    description: msg`Brief reason for the change`,
    icon: 'IconQuestionMark',
  })
  @WorkspaceIsNullable()
  changeReason?: string;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.changeDescription,
    type: FieldMetadataType.TEXT,
    label: msg`Change Description`,
    description: msg`Detailed description of the change`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  changeDescription?: string;

  // === CONTEXT CHANGE ===
  // @WorkspaceRelation({
  //   standardId: MKT_KPI_HISTORY_FIELD_IDS.changedByWorkspaceMember,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Changed By`,
  //   description: msg`Person who made the change`,
  //   icon: 'IconUser',
  //   inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
  //   inverseSideFieldKey: 'changedKpiHistories',
  //   onDelete: RelationOnDeleteAction.SET_NULL,
  // })
  // @WorkspaceIsNullable()
  // changedByWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;
  //
  // @WorkspaceJoinColumn('changedByWorkspaceMember')
  // changedByWorkspaceMemberId: string | null;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.changeSource,
    type: FieldMetadataType.SELECT,
    label: msg`Change Source`,
    description: msg`Source of the change`,
    icon: 'IconSource',
    options: MKT_KPI_HISTORY_CHANGE_SOURCE_OPTIONS,
  })
  @WorkspaceIsNullable()
  changeSource?: string;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Change Timestamp`,
    description: msg`Exact time when the change was made`,
    icon: 'IconClock',
    defaultValue: 'now',
  })
  changeTimestamp: Date;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.additionalData,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Additional Data`,
    description: msg`Additional data about the change`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  additionalData?: object;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in history list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.kpi,
    type: RelationType.MANY_TO_ONE,
    label: msg`KPI`,
    description: msg`KPI that was changed`,
    icon: 'IconTarget',
    inverseSideTarget: () => MktKpiWorkspaceEntity,
    inverseSideFieldKey: 'kpiHistories',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  kpi: Relation<MktKpiWorkspaceEntity>;

  @WorkspaceJoinColumn('kpi')
  kpiId: string;

  @WorkspaceField({
    standardId: MKT_KPI_HISTORY_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_KPI_HISTORY,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
