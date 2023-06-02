import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { Pipeline } from '../@generated/pipeline/pipeline.model';
import { FindManyPipelineArgs } from '../@generated/pipeline/find-many-pipeline.args';
import { ArgsService } from './services/args.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Pipeline)
export class PipelineResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [Pipeline])
  async findManyPipeline(
    @Args() args: FindManyPipelineArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyPipelineArgs>(
        args,
        workspace,
      );
    return this.prismaService.pipeline.findMany(preparedArgs);
  }
}
