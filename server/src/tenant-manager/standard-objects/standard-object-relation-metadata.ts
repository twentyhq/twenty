import activityRelationMetadata from 'src/tenant-manager/standard-objects/relations/activity';
import companyRelationMetadata from 'src/tenant-manager/standard-objects/relations/company';
import personRelationMetadata from 'src/tenant-manager/standard-objects/relations/person';
import pipelineStepRelationMetadata from 'src/tenant-manager/standard-objects/relations/pipeline-step';
import viewRelationMetadata from 'src/tenant-manager/standard-objects/relations/view';
import workspaceMemberRelationMetadata from 'src/tenant-manager/standard-objects/relations/workspace-member';

export const standardObjectRelationMetadata = [
  ...activityRelationMetadata,
  ...companyRelationMetadata,
  ...personRelationMetadata,
  ...pipelineStepRelationMetadata,
  ...viewRelationMetadata,
  ...workspaceMemberRelationMetadata,
];
