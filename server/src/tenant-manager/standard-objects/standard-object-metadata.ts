import activityTargetMetadata from 'src/tenant-manager/standard-objects/activity-target';
import activityMetadata from 'src/tenant-manager/standard-objects/activity';
import apiKeyMetadata from 'src/tenant-manager/standard-objects/api-key';
import attachmentMetadata from 'src/tenant-manager/standard-objects/attachment';
import commentMetadata from 'src/tenant-manager/standard-objects/comment';
import favoriteMetadata from 'src/tenant-manager/standard-objects/favorite';
import opportunityMetadata from 'src/tenant-manager/standard-objects/opportunity';
import personMetadata from 'src/tenant-manager/standard-objects/person';
import viewMetadata from 'src/tenant-manager/standard-objects/view';
import viewFieldMetadata from 'src/tenant-manager/standard-objects/view-field';
import viewFilterMetadata from 'src/tenant-manager/standard-objects/view-filter';
import viewSortMetadata from 'src/tenant-manager/standard-objects/view-sort';
import webhookMetadata from 'src/tenant-manager/standard-objects/webhook';
import pipelineStepMetadata from 'src/tenant-manager/standard-objects/pipeline-step';
import companyMetadata from 'src/tenant-manager/standard-objects/company';
import workspaceMemberMetadata from 'src/tenant-manager/standard-objects/workspace-member';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';

export const standardObjectsMetadata = {
  activityTargetV2: activityTargetMetadata,
  activityV2: activityMetadata,
  apiKeyV2: apiKeyMetadata,
  attachmentV2: attachmentMetadata,
  commentV2: commentMetadata,
  companyV2: companyMetadata,
  favoriteV2: favoriteMetadata,
  opportunityV2: opportunityMetadata,
  personV2: personMetadata,
  pipelineStepV2: pipelineStepMetadata,
  viewFieldV2: viewFieldMetadata,
  viewFilterV2: viewFilterMetadata,
  viewSortV2: viewSortMetadata,
  viewV2: viewMetadata,
  webhookV2: webhookMetadata,
  workspaceMemberV2: workspaceMemberMetadata,
};

export const basicFieldsMetadata: Partial<FieldMetadataEntity>[] = [
  {
    name: 'id',
    label: 'Id',
    type: FieldMetadataType.UUID,
    targetColumnMap: {
      value: 'id',
    },
    isNullable: true,
    // isSystem: true,
    isCustom: false,
    isActive: true,
  },
  {
    name: 'createdAt',
    label: 'Creation date',
    type: FieldMetadataType.DATE,
    targetColumnMap: {
      value: 'createdAt',
    },
    icon: 'IconCalendar',
    isNullable: true,
    isCustom: false,
    isActive: true,
  },
  {
    name: 'updatedAt',
    label: 'Update date',
    type: FieldMetadataType.DATE,
    targetColumnMap: {
      value: 'updatedAt',
    },
    icon: 'IconCalendar',
    isNullable: true,
    isCustom: false,
    isActive: true,
  },
];
