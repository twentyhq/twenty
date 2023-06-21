import { Resolver, Args, Query, Mutation, Info } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
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
import { PrismaSelect } from 'src/utils/prisma-select';
import { GraphQLResolveInfo } from 'graphql';

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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<PipelineProgress>[]> {
    const select = new PrismaSelect('PipelineProgress', info, {
      defaultFields: {
        PipelineProgress: {
          id: true,
        },
      },
    }).value;

    return this.pipelineProgressService.findMany({
      ...args,
      where: {
        ...args.where,
        AND: [accessibleBy(ability).PipelineProgress],
      },
      select,
    });
  }

  @Mutation(() => PipelineProgress, {
    nullable: true,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdatePipelineProgressAbilityHandler)
  async updateOnePipelineProgress(
    @Args() args: UpdateOnePipelineProgressArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<PipelineProgress> | null> {
    const select = new PrismaSelect('PipelineProgress', info, {
      defaultFields: {
        PipelineProgress: {
          id: true,
        },
      },
    }).value;

    return this.pipelineProgressService.update({
      ...args,
      select,
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
      ...args,
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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<PipelineProgress>> {
    const select = new PrismaSelect('PipelineProgress', info, {
      defaultFields: {
        PipelineProgress: {
          id: true,
        },
      },
    }).value;

    return this.pipelineProgressService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select,
    } as Prisma.PipelineProgressCreateArgs);
  }
}
