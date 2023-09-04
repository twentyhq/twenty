import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { PipelineStage } from 'src/core/@generated/pipeline-stage/pipeline-stage.model';
import { FindManyPipelineStageArgs } from 'src/core/@generated/pipeline-stage/find-many-pipeline-stage.args';
import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreatePipelineStageAbilityHandler,
  DeletePipelineStageAbilityHandler,
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
import { CreateOnePipelineStageArgs } from 'src/core/@generated/pipeline-stage/create-one-pipeline-stage.args';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { DeleteOnePipelineStageArgs } from 'src/core/@generated/pipeline-stage/delete-one-pipeline-stage.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineStage)
export class PipelineStageResolver {
  constructor(private readonly pipelineStageService: PipelineStageService) {}

  @Mutation(() => PipelineStage, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreatePipelineStageAbilityHandler)
  async createOnePipelineStage(
    @Args() args: CreateOnePipelineStageArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'PipelineStage' })
    prismaSelect: PrismaSelect<'PipelineStage'>,
  ): Promise<Partial<PipelineStage>> {
    return this.pipelineStageService.create({
      data: {
        ...args.data,
        workspace: { connect: { id: workspace.id } },
      },
      select: prismaSelect.value,
    } as Prisma.PipelineStageCreateArgs);
  }

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

  @Mutation(() => PipelineStage, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeletePipelineStageAbilityHandler)
  async deleteOnePipelineStage(
    @Args() args: DeleteOnePipelineStageArgs,
  ): Promise<PipelineStage> {
    const pipelineStageToDelete = await this.pipelineStageService.findUnique({
      where: args.where,
    });

    if (!pipelineStageToDelete) {
      throw new NotFoundException();
    }

    const { pipelineId } = pipelineStageToDelete;

    const remainingPipelineStages = await this.pipelineStageService.findMany({
      orderBy: { index: 'asc' },
      where: {
        pipelineId,
        NOT: { id: pipelineStageToDelete.id },
      },
    });

    if (!remainingPipelineStages.length) {
      throw new ForbiddenException(
        `Deleting last pipeline stage is not allowed`,
      );
    }

    const deletedPipelineStage = await this.pipelineStageService.delete({
      where: args.where,
    });

    await Promise.all(
      remainingPipelineStages.map((pipelineStage, index) => {
        if (pipelineStage.index === index) return;

        return this.pipelineStageService.update({
          data: { index },
          where: { id: pipelineStage.id },
        });
      }),
    );

    return deletedPipelineStage;
  }
}
