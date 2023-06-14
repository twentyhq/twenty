import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { ArgsService } from './services/args.service';
import { FindManyPipelineProgressArgs } from '../@generated/pipeline-progress/find-many-pipeline-progress.args';
import { PipelineProgress } from '../@generated/pipeline-progress/pipeline-progress.model';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineProgress)
export class PipelineProgressResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [PipelineProgress])
  async findManyPipelineProgress(
    @Args() args: FindManyPipelineProgressArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyPipelineProgressArgs>(
        args,
        workspace,
      );
    return this.prismaService.pipelineProgress.findMany(preparedArgs);
  }
}
