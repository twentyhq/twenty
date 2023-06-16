import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineProgress } from 'src/core/@generated/pipeline-progress/pipeline-progress.model';
import { PipelineStage } from 'src/core/@generated/pipeline-stage/pipeline-stage.model';
import { Pipeline } from 'src/core/@generated/pipeline/pipeline.model';
import { PipelineStageService } from '../services/pipeline-stage.service';
import { PipelineService } from '../services/pipeline.service';

@TypeGraphQL.Resolver(() => PipelineProgress)
export class PipelineProgressRelationsResolver {
  constructor(
    private readonly pipelineStageService: PipelineStageService,
    private readonly pipelineService: PipelineService,
  ) {}

  @TypeGraphQL.ResolveField(() => PipelineStage, {
    nullable: false,
  })
  async pipelineStage(
    @TypeGraphQL.Root() pipelineStage: PipelineProgress,
  ): Promise<PipelineStage> {
    return this.pipelineStageService.findUniqueOrThrow({
      where: {
        id: pipelineStage.pipelineStageId,
      },
    });
  }

  @TypeGraphQL.ResolveField(() => Pipeline, {
    nullable: false,
  })
  async pipeline(
    @TypeGraphQL.Root() pipelineStage: PipelineProgress,
  ): Promise<Pipeline> {
    return this.pipelineService.findUniqueOrThrow({
      where: {
        id: pipelineStage.pipelineId,
      },
    });
  }
}
