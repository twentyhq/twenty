import activityRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/activity';
import companyRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/company';
import personRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/person';
import pipelineStepRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/pipeline-step';
import viewRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/view';
import workspaceMemberRelationMetadata from 'src/workspace/workspace-manager/standard-objects/relations/workspace-member';

export const standardObjectRelationMetadata = [
  ...activityRelationMetadata,
  ...companyRelationMetadata,
  ...personRelationMetadata,
  ...pipelineStepRelationMetadata,
  ...viewRelationMetadata,
  ...workspaceMemberRelationMetadata,
];
