import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineStage } from 'src/core/@generated/pipeline-stage/pipeline-stage.model';
import { Pipeline } from 'src/core/@generated/pipeline/pipeline.model';
import { PipelineStageService } from '../services/pipeline-stage.service';

@TypeGraphQL.Resolver(() => Pipeline)
export class PipelineRelationsResolver {
  constructor(private readonly pipelineStageService: PipelineStageService) {}

  @TypeGraphQL.ResolveField(() => [PipelineStage], {
    nullable: false,
  })
  async pipelineStages(
    @TypeGraphQL.Root() pipeline: Pipeline,
  ): Promise<PipelineStage[]> {
    return this.pipelineStageService.findMany({
      where: {
        pipelineId: {
          equals: pipeline.id,
        },
      },
    });
  }
}
