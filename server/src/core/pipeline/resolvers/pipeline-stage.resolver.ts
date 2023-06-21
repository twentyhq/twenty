import { Resolver, Args, Query, Info } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { PipelineStage } from '../../../core/@generated/pipeline-stage/pipeline-stage.model';
import { FindManyPipelineStageArgs } from '../../../core/@generated/pipeline-stage/find-many-pipeline-stage.args';
import { PipelineStageService } from '../services/pipeline-stage.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadPipelineStageAbilityHandler } from 'src/ability/handlers/pipeline-stage.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { PrismaSelect } from 'src/utils/prisma-select';
import { GraphQLResolveInfo } from 'graphql';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineStage)
export class PipelineStageResolver {
  constructor(private readonly pipelineStageService: PipelineStageService) {}

  @Query(() => [PipelineStage])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPipelineStageAbilityHandler)
  async findManyPipelineStage(
    @Args() args: FindManyPipelineStageArgs,
    @UserAbility() ability: AppAbility,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<PipelineStage>[]> {
    const select = new PrismaSelect('PipelineStage', info, {
      defaultFields: {
        PipelineStage: {
          id: true,
        },
      },
    }).value;

    return this.pipelineStageService.findMany({
      ...args,
      where: {
        ...args.where,
        AND: [accessibleBy(ability).PipelineStage],
      },
      select,
    });
  }
}
