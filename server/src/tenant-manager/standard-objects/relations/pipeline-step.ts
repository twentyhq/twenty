import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const pipelineStepRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'pipelineStepV2',
    toObjectNameSingular: 'opportunityV2',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'pipelineStep',
  },
];

export default pipelineStepRelationMetadata;
