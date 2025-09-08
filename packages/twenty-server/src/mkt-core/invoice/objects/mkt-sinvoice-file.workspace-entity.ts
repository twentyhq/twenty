import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
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
import { MKT_SINVOICE_FILE_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import {
  SINVOICE_FILE_STATUS,
  SINVOICE_FILE_STATUS_OPTIONS,
  SINVOICE_FILE_TYPE,
  SINVOICE_FILE_TYPE_OPTIONS,
} from 'src/mkt-core/invoice/invoice.constants';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_SINVOICE_FILE_NAME = 'mktSInvoiceFile';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_SINVOICE_FILE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: 'fileName', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktSInvoiceFile,
  namePlural: `${TABLE_SINVOICE_FILE_NAME}s`,
  labelSingular: msg`SInvoice File`,
  labelPlural: msg`SInvoice Files`,
  description: msg`SInvoice file entity for storing invoice file information`,
  icon: 'IconFile',
  labelIdentifierStandardId: MKT_SINVOICE_FILE_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['fileName']])
@WorkspaceIsSearchable()
export class MktSInvoiceFileWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`File Name`,
    description: msg`Display name for the invoice file`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.supplierTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Supplier Tax Code`,
    description: msg`Supplier tax code`,
    icon: 'IconFile',
  })
  @WorkspaceIsNullable()
  supplierTaxCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.invoiceNo,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice No`,
    description: msg`Invoice no`,
    icon: 'IconFile',
  })
  @WorkspaceIsNullable()
  invoiceNo?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.templateCode,
    type: FieldMetadataType.TEXT,
    label: msg`Template Code`,
    description: msg`Template code`,
    icon: 'IconFile',
  })
  @WorkspaceIsNullable()
  templateCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.fileType,
    type: FieldMetadataType.SELECT,
    label: msg`File Type`,
    description: msg`File type (PDF, ZIP)`,
    icon: 'IconTag',
    options: SINVOICE_FILE_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  fileType?: SINVOICE_FILE_TYPE;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.fileName,
    type: FieldMetadataType.TEXT,
    label: msg`File Name`,
    description: msg`Original file name`,
    icon: 'IconFile',
  })
  @WorkspaceIsNullable()
  fileName?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.fileSize,
    type: FieldMetadataType.NUMBER,
    label: msg`File Size`,
    description: msg`File size in bytes`,
    icon: 'IconDatabase',
  })
  @WorkspaceIsNullable()
  fileSize?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.filePath,
    type: FieldMetadataType.TEXT,
    label: msg`File Path`,
    description: msg`Local file path`,
    icon: 'IconFolder',
  })
  @WorkspaceIsNullable()
  filePath?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.downloadUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Download URL`,
    description: msg`URL to download the file`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  downloadUrl?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.downloadCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Download Count`,
    description: msg`Number of times the file has been downloaded`,
    icon: 'IconDownload',
  })
  @WorkspaceIsNullable()
  downloadCount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.lastDownloadedAt,
    type: FieldMetadataType.DATE,
    label: msg`Last Downloaded At`,
    description: msg`Last time the file was downloaded`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  lastDownloadedAt?: Date;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`File status (GETTING, PENDING, SUCCESS, FAILED, ERROR)`,
    icon: 'IconCheck',
    options: SINVOICE_FILE_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status?: SINVOICE_FILE_STATUS;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.errorMessage,
    type: FieldMetadataType.TEXT,
    label: msg`Error Message`,
    description: msg`Error message if file download failed`,
    icon: 'IconAlertCircle',
  })
  @WorkspaceIsNullable()
  errorMessage?: string;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.mktSInvoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`SInvoice`,
    description: msg`SInvoice linked to this file`,
    icon: 'IconReceipt',
    inverseSideTarget: () => MktSInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceFiles',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoice: Relation<MktSInvoiceWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktSInvoice')
  mktSInvoiceId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the invoice file`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktSInvoiceFiles',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the invoice file`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceFile',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  // Common fields
  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FILE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_SINVOICE_FILE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
