import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineProgress } from 'src/core/@generated/pipeline-progress/pipeline-progress.model';
import { PipelineStage } from 'src/core/@generated/pipeline-stage/pipeline-stage.model';
import { PipelineProgressService } from '../services/pipeline-progress.service';

@TypeGraphQL.Resolver(() => PipelineStage)
export class PipelineStageRelationsResolver {
  constructor(
    private readonly pipelineProgressService: PipelineProgressService,
  ) {}

  @TypeGraphQL.ResolveField(() => [PipelineProgress], {
    nullable: false,
  })
  async pipelineProgresses(
    @TypeGraphQL.Root() pipelineStage: PipelineStage,
  ): Promise<PipelineProgress[]> {
    return this.pipelineProgressService.findMany({
      where: {
        pipelineStageId: {
          equals: pipelineStage.id,
        },
      },
    });
  }
}
