import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const pipelineStepRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'pipelineStep',
    toObjectNameSingular: 'opportunity',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'pipelineStep',
  },
];

export default pipelineStepRelationMetadata;
