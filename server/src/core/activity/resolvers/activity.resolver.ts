import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateActivityAbilityHandler,
  DeleteActivityAbilityHandler,
  ReadActivityAbilityHandler,
  UpdateActivityAbilityHandler,
} from 'src/ability/handlers/activity.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { Activity } from 'src/core/@generated/activity/activity.model';
import { ActivityService } from 'src/core/activity/services/activity.service';
import { CreateOneActivityArgs } from 'src/core/@generated/activity/create-one-activity.args';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { UpdateOneActivityArgs } from 'src/core/@generated/activity/update-one-activity.args';
import { FindManyActivityArgs } from 'src/core/@generated/activity/find-many-activity.args';
import { DeleteManyActivityArgs } from 'src/core/@generated/activity/delete-many-activity.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => Activity)
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Mutation(() => Activity, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateActivityAbilityHandler)
  async createOneActivity(
    @Args() args: CreateOneActivityArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Activity' })
    prismaSelect: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>> {
    const createdActivity = await this.upsertOneActivity(
      args,
      workspace,
      prismaSelect,
    );

    return createdActivity;
  }

  async upsertOneActivity(
    args: CreateOneActivityArgs,
    workspace: Workspace,
    select: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>> {
    // TODO: Do a proper check with recursion testing on args in a more generic place
    for (const key in args.data) {
      if (args.data[key]) {
        for (const subKey in args.data[key]) {
          if (JSON.stringify(args.data[key][subKey]) === '{}') {
            delete args.data[key][subKey];
          }
        }
      }

      if (JSON.stringify(args.data[key]) === '{}') {
        delete args.data[key];
      }
    }

    const activity = await this.activityService.upsert({
      create: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
        activityTargets: args.data?.activityTargets?.createMany
          ? {
              createMany: {
                data: args.data.activityTargets.createMany.data.map(
                  (target) => ({ ...target, workspaceId: workspace.id }),
                ),
              },
            }
          : undefined,
      },
      update: {
        ...args.data,
        activityTargets: args.data?.activityTargets
          ? {
              createMany: args.data.activityTargets.createMany
                ? {
                    data: args.data.activityTargets.createMany.data.map(
                      (target) => ({
                        ...target,
                        workspaceId: workspace.id,
                      }),
                    ),
                  }
                : undefined,
            }
          : undefined,
      },
      where: {
        id: args.data.id,
      },
      select: select.value,
    });

    return activity;
  }

  @Mutation(() => Activity, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateActivityAbilityHandler)
  async updateOneActivity(
    @Args() args: UpdateOneActivityArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Activity' })
    prismaSelect: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>> {
    // TODO: Do a proper check with recursion testing on args in a more generic place
    for (const key in args.data) {
      if (args.data[key]) {
        for (const subKey in args.data[key]) {
          if (JSON.stringify(args.data[key][subKey]) === '{}') {
            delete args.data[key][subKey];
          }
        }
      }

      if (JSON.stringify(args.data[key]) === '{}') {
        delete args.data[key];
      }
    }
    const updatedActivity = await this.activityService.update({
      where: args.where,
      data: {
        ...args.data,
        activityTargets: args.data?.activityTargets
          ? {
              createMany: args.data.activityTargets.createMany
                ? {
                    data: args.data.activityTargets.createMany.data.map(
                      (target) => ({
                        ...target,
                        workspaceId: workspace.id,
                      }),
                    ),
                  }
                : undefined,
              deleteMany: args.data.activityTargets.deleteMany ?? undefined,
            }
          : undefined,
      },
      select: prismaSelect.value,
    } as Prisma.ActivityUpdateArgs);

    return updatedActivity;
  }

  @Query(() => [Activity])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadActivityAbilityHandler)
  async findManyActivities(
    @Args() args: FindManyActivityArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Activity' })
    prismaSelect: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>[]> {
    const result = await this.activityService.findMany({
      where: {
        ...args.where,
        AND: [accessibleBy(ability).Activity],
      },
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });

    return result;
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteActivityAbilityHandler)
  async deleteManyActivities(
    @Args() args: DeleteManyActivityArgs,
  ): Promise<AffectedRows> {
    return this.activityService.deleteMany({
      where: args.where,
    });
  }
}
