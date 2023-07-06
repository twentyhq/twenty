import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { FindManyPipelineProgressArgs } from '../../@generated/pipeline-progress/find-many-pipeline-progress.args';
import { PipelineProgress } from '../../@generated/pipeline-progress/pipeline-progress.model';
import { UpdateOnePipelineProgressArgs } from '../../@generated/pipeline-progress/update-one-pipeline-progress.args';
import { AffectedRows } from '../../@generated/prisma/affected-rows.output';
import { DeleteManyPipelineProgressArgs } from '../../@generated/pipeline-progress/delete-many-pipeline-progress.args';
import { CreateOnePipelineProgressArgs } from '../../@generated/pipeline-progress/create-one-pipeline-progress.args';
import { PipelineProgressService } from '../services/pipeline-progress.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreatePipelineProgressAbilityHandler,
  ReadPipelineProgressAbilityHandler,
  UpdatePipelineProgressAbilityHandler,
  DeletePipelineProgressAbilityHandler,
} from 'src/ability/handlers/pipeline-progress.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Resolver(() => PipelineProgress)
export class PipelineProgressResolver {
  constructor(
    private readonly pipelineProgressService: PipelineProgressService,
  ) {}

  @Query(() => [PipelineProgress])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPipelineProgressAbilityHandler)
  async findManyPipelineProgress(
    @Args() args: FindManyPipelineProgressArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'PipelineProgress' })
    prismaSelect: PrismaSelect<'PipelineProgress'>,
  ): Promise<Partial<PipelineProgress>[]> {
    return this.pipelineProgressService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).PipelineProgress],
          }
        : accessibleBy(ability).PipelineProgress,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => PipelineProgress, {
    nullable: true,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdatePipelineProgressAbilityHandler)
  async updateOnePipelineProgress(
    @Args() args: UpdateOnePipelineProgressArgs,
    @PrismaSelector({ modelName: 'PipelineProgress' })
    prismaSelect: PrismaSelect<'PipelineProgress'>,
  ): Promise<Partial<PipelineProgress> | null> {
    return this.pipelineProgressService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.PipelineProgressUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeletePipelineProgressAbilityHandler)
  async deleteManyPipelineProgress(
    @Args() args: DeleteManyPipelineProgressArgs,
  ): Promise<AffectedRows> {
    return this.pipelineProgressService.deleteMany({
      where: args.where,
    });
  }

  @Mutation(() => PipelineProgress, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreatePipelineProgressAbilityHandler)
  async createOnePipelineProgress(
    @Args() args: CreateOnePipelineProgressArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'PipelineProgress' })
    prismaSelect: PrismaSelect<'PipelineProgress'>,
  ): Promise<Partial<PipelineProgress>> {
    return this.pipelineProgressService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    } as Prisma.PipelineProgressCreateArgs);
  }
}
