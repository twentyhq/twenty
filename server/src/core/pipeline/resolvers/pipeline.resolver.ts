import { Resolver, Args, Query, Info } from '@nestjs/graphql';
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
import { GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from 'src/utils/prisma-select';

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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<Pipeline>[]> {
    const select = new PrismaSelect('Pipeline', info, {
      defaultFields: {
        Pipeline: {
          id: true,
        },
      },
    }).value;

    return this.pipelineService.findMany({
      ...args,
      where: {
        ...args.where,
        AND: [accessibleBy(ability).Pipeline],
      },
      select,
    });
  }
}
