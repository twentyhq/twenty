import apiKeyMetadata from 'src/workspace/workspace-manager/standard-objects/api-key';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import activityMetadata from 'src/workspace/workspace-manager/standard-objects/activity';
import activityTargetMetadata from 'src/workspace/workspace-manager/standard-objects/activity-target';
import attachmentMetadata from 'src/workspace/workspace-manager/standard-objects/attachment';
import commentMetadata from 'src/workspace/workspace-manager/standard-objects/comment';
import companyMetadata from 'src/workspace/workspace-manager/standard-objects/company';
import favoriteMetadata from 'src/workspace/workspace-manager/standard-objects/favorite';
import opportunityMetadata from 'src/workspace/workspace-manager/standard-objects/opportunity';
import personMetadata from 'src/workspace/workspace-manager/standard-objects/person';
import pipelineStepMetadata from 'src/workspace/workspace-manager/standard-objects/pipeline-step';
import viewMetadata from 'src/workspace/workspace-manager/standard-objects/view';
import viewFieldMetadata from 'src/workspace/workspace-manager/standard-objects/view-field';
import viewFilterMetadata from 'src/workspace/workspace-manager/standard-objects/view-filter';
import viewSortMetadata from 'src/workspace/workspace-manager/standard-objects/view-sort';
import workspaceMemberMetadata from 'src/workspace/workspace-manager/standard-objects/workspace-member';
import connectedAccountMetadata from 'src/workspace/workspace-manager/standard-objects/connected-account';

export const standardObjectsMetadata = {
  activityTarget: activityTargetMetadata,
  activity: activityMetadata,
  apiKey: apiKeyMetadata,
  attachment: attachmentMetadata,
  comment: commentMetadata,
  company: companyMetadata,
  connectedAccount: connectedAccountMetadata,
  favorite: favoriteMetadata,
  opportunity: opportunityMetadata,
  person: personMetadata,
  pipelineStep: pipelineStepMetadata,
  viewField: viewFieldMetadata,
  viewFilter: viewFilterMetadata,
  viewSort: viewSortMetadata,
  view: viewMetadata,
  workspaceMember: workspaceMemberMetadata,
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
    isSystem: true,
    isCustom: false,
    isActive: true,
    defaultValue: { type: 'uuid' },
  },
  {
    name: 'createdAt',
    label: 'Creation date',
    type: FieldMetadataType.DATE_TIME,
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
    type: FieldMetadataType.DATE_TIME,
    targetColumnMap: {
      value: 'updatedAt',
    },
    icon: 'IconCalendar',
    isNullable: true,
    isCustom: false,
    isSystem: true,
    isActive: true,
    defaultValue: { type: 'now' },
  },
];
