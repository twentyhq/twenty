import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt.auth.guard';
import { Workspace } from '../../@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { Pipeline } from '../../@generated/pipeline/pipeline.model';
import { FindManyPipelineArgs } from '../../@generated/pipeline/find-many-pipeline.args';
import { PipelineService } from '../services/pipeline.service';
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';

@UseGuards(JwtAuthGuard)
@Resolver(() => Pipeline)
export class PipelineResolver {
  constructor(private readonly pipelineService: PipelineService) {}

  @Query(() => [Pipeline])
  async findManyPipeline(
    @Args() args: FindManyPipelineArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs = prepareFindManyArgs<FindManyPipelineArgs>(
      args,
      workspace,
    );
    return this.pipelineService.findMany(preparedArgs);
  }
}
