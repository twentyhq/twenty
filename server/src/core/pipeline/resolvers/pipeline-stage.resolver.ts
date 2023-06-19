import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { PipelineStage } from '../../../core/@generated/pipeline-stage/pipeline-stage.model';
import { FindManyPipelineStageArgs } from '../../../core/@generated/pipeline-stage/find-many-pipeline-stage.args';
import { PipelineStageService } from '../services/pipeline-stage.service';
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadPipelineStageAbilityHandler } from 'src/ability/handlers/pipeline-stage.ability-handler';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineStage)
export class PipelineStageResolver {
  constructor(private readonly pipelineStageService: PipelineStageService) {}

  @Query(() => [PipelineStage])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPipelineStageAbilityHandler)
  async findManyPipelineStage(
    @Args() args: FindManyPipelineStageArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs = prepareFindManyArgs<FindManyPipelineStageArgs>(
      args,
      workspace,
    );

    return this.pipelineStageService.findMany(preparedArgs);
  }
}
