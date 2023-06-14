import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineProgress } from 'src/api/@generated/pipeline-progress/pipeline-progress.model';
import { PipelineStage } from 'src/api/@generated/pipeline-stage/pipeline-stage.model';
import { Pipeline } from 'src/api/@generated/pipeline/pipeline.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => PipelineProgress)
export class PipelineProgressRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => PipelineStage, {
    nullable: false,
  })
  async pipelineStage(
    @TypeGraphQL.Root() pipelineStage: PipelineProgress,
  ): Promise<PipelineStage> {
    return this.prismaService.pipelineStage.findUniqueOrThrow({
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
    return this.prismaService.pipeline.findUniqueOrThrow({
      where: {
        id: pipelineStage.pipelineId,
      },
    });
  }
}
