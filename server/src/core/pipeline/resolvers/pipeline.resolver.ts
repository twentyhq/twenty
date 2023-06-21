import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Pipeline } from '../../@generated/pipeline/pipeline.model';
import { FindManyPipelineArgs } from '../../@generated/pipeline/find-many-pipeline.args';
import { PipelineService } from '../services/pipeline.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadPipelineAbilityHandler } from 'src/ability/handlers/pipeline.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';

@UseGuards(JwtAuthGuard)
@Resolver(() => Pipeline)
export class PipelineResolver {
  constructor(private readonly pipelineService: PipelineService) {}

  @Query(() => [Pipeline])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPipelineAbilityHandler)
  async findManyPipeline(
    @Args() args: FindManyPipelineArgs,
    @UserAbility() ability: AppAbility,
  ) {
    return this.pipelineService.findMany({
      ...args,
      where: {
        ...args.where,
        AND: [accessibleBy(ability).Pipeline],
      },
    });
  }
}
