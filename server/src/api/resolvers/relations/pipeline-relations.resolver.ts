import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineStage } from 'src/api/@generated/pipeline-stage/pipeline-stage.model';
import { Pipeline } from 'src/api/@generated/pipeline/pipeline.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => Pipeline)
export class PipelineRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => [PipelineStage], {
    nullable: false,
  })
  async pipelineStages(
    @TypeGraphQL.Root() pipeline: Pipeline,
  ): Promise<PipelineStage[]> {
    return this.prismaService.pipelineStage.findMany({
      where: {
        pipelineId: {
          equals: pipeline.id,
        },
      },
    });
  }
}
