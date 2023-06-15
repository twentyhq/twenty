import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { FindManyPipelineProgressArgs } from '../../@generated/pipeline-progress/find-many-pipeline-progress.args';
import { PipelineProgress } from '../../@generated/pipeline-progress/pipeline-progress.model';
import { UpdateOnePipelineProgressArgs } from '../../@generated/pipeline-progress/update-one-pipeline-progress.args';
import { Prisma } from '@prisma/client';
import { AffectedRows } from '../../@generated/prisma/affected-rows.output';
import { DeleteManyPipelineProgressArgs } from '../../@generated/pipeline-progress/delete-many-pipeline-progress.args';
import { CreateOnePipelineProgressArgs } from '../../@generated/pipeline-progress/create-one-pipeline-progress.args';
import { PipelineProgressService } from '../services/pipeline-progress.service';
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineProgress)
export class PipelineProgressResolver {
  constructor(
    private readonly pipelineProgressService: PipelineProgressService,
  ) {}

  @Query(() => [PipelineProgress])
  async findManyPipelineProgress(
    @Args() args: FindManyPipelineProgressArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs = prepareFindManyArgs<FindManyPipelineProgressArgs>(
      args,
      workspace,
    );
    return this.pipelineProgressService.findMany(preparedArgs);
  }

  @Mutation(() => PipelineProgress, {
    nullable: true,
  })
  async updateOnePipelineProgress(
    @Args() args: UpdateOnePipelineProgressArgs,
  ): Promise<PipelineProgress | null> {
    return this.pipelineProgressService.update({
      ...args,
    } satisfies UpdateOnePipelineProgressArgs as Prisma.PipelineProgressUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  async deleteManyPipelineProgress(
    @Args() args: DeleteManyPipelineProgressArgs,
  ): Promise<AffectedRows> {
    return this.pipelineProgressService.deleteMany({
      ...args,
    });
  }

  @Mutation(() => PipelineProgress, {
    nullable: false,
  })
  async createOnePipelineProgress(
    @Args() args: CreateOnePipelineProgressArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PipelineProgress> {
    return this.pipelineProgressService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    } satisfies CreateOnePipelineProgressArgs as Prisma.PipelineProgressCreateArgs);
  }
}
