import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { PipelineStage } from 'src/core/@generated/pipeline-stage/pipeline-stage.model';
import { FindManyPipelineStageArgs } from 'src/core/@generated/pipeline-stage/find-many-pipeline-stage.args';
import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  ReadPipelineStageAbilityHandler,
  UpdatePipelineStageAbilityHandler,
} from 'src/ability/handlers/pipeline-stage.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { UpdateOnePipelineStageArgs } from 'src/core/@generated/pipeline-stage/update-one-pipeline-stage.args';

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
    @PrismaSelector({ modelName: 'PipelineStage' })
    prismaSelect: PrismaSelect<'PipelineStage'>,
  ): Promise<Partial<PipelineStage>[]> {
    return this.pipelineStageService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).PipelineStage],
          }
        : accessibleBy(ability).PipelineStage,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => PipelineStage, {
    nullable: true,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdatePipelineStageAbilityHandler)
  async updateOnePipelineStage(
    @Args() args: UpdateOnePipelineStageArgs,
    @PrismaSelector({ modelName: 'PipelineProgress' })
    prismaSelect: PrismaSelect<'PipelineProgress'>,
  ): Promise<Partial<PipelineStage> | null> {
    return this.pipelineStageService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.PipelineProgressUpdateArgs);
  }
}
