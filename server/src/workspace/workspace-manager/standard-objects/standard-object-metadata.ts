import activityTargetMetadata from 'src/workspace/workspace-manager/standard-objects/activity-target';
import activityMetadata from 'src/workspace/workspace-manager/standard-objects/activity';
import apiKeyMetadata from 'src/workspace/workspace-manager/standard-objects/api-key';
import attachmentMetadata from 'src/workspace/workspace-manager/standard-objects/attachment';
import commentMetadata from 'src/workspace/workspace-manager/standard-objects/comment';
import favoriteMetadata from 'src/workspace/workspace-manager/standard-objects/favorite';
import opportunityMetadata from 'src/workspace/workspace-manager/standard-objects/opportunity';
import personMetadata from 'src/workspace/workspace-manager/standard-objects/person';
import viewMetadata from 'src/workspace/workspace-manager/standard-objects/view';
import viewFieldMetadata from 'src/workspace/workspace-manager/standard-objects/view-field';
import viewFilterMetadata from 'src/workspace/workspace-manager/standard-objects/view-filter';
import viewSortMetadata from 'src/workspace/workspace-manager/standard-objects/view-sort';
import webhookMetadata from 'src/workspace/workspace-manager/standard-objects/webhook';
import pipelineStepMetadata from 'src/workspace/workspace-manager/standard-objects/pipeline-step';
import companyMetadata from 'src/workspace/workspace-manager/standard-objects/company';
import workspaceMemberMetadata from 'src/workspace/workspace-manager/standard-objects/workspace-member';
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
    defaultValue: { type: 'uuid' },
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
    defaultValue: { type: 'now' },
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
    defaultValue: { type: 'now' },
  },
];
