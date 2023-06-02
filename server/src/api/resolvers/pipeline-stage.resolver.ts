import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { PipelineStage } from '../@generated/pipeline-stage/pipeline-stage.model';
import { FindManyPipelineStageArgs } from '../@generated/pipeline-stage/find-many-pipeline-stage.args';
import { ArgsService } from './services/args.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineStage)
export class PipelineStageResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [PipelineStage])
  async findManyPipelineStage(
    @Args() args: FindManyPipelineStageArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyPipelineStageArgs>(
        args,
        workspace,
      );
    return this.prismaService.pipelineStage.findMany(preparedArgs);
  }
}
