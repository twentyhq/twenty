import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { AppAbility } from 'src/ability/ability.factory';
import {
  CreateViewFieldAbilityHandler,
  ReadViewFieldAbilityHandler,
  UpdateViewFieldAbilityHandler,
} from 'src/ability/handlers/view-field.ability-handler';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { CreateManyViewFieldArgs } from 'src/core/@generated/view-field/create-many-view-field.args';
import { FindManyViewFieldArgs } from 'src/core/@generated/view-field/find-many-view-field.args';
import { UpdateOneViewFieldArgs } from 'src/core/@generated/view-field/update-one-view-field.args';
import { ViewField } from 'src/core/@generated/view-field/view-field.model';
import { ViewFieldService } from 'src/core/view/services/view-field.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CreateOneViewFieldArgs } from 'src/core/@generated/view-field/create-one-view-field.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => ViewField)
export class ViewFieldResolver {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Mutation(() => ViewField, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewFieldAbilityHandler)
  async createOneViewField(
    @Args() args: CreateOneViewFieldArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'ViewField' })
    prismaSelect: PrismaSelect<'ViewField'>,
  ): Promise<Partial<ViewField>> {
    return this.viewFieldService.create({
      data: {
        ...args.data,
        workspace: { connect: { id: workspace.id } },
      },
      select: prismaSelect.value,
    });
  }

  @Mutation(() => AffectedRows)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewFieldAbilityHandler)
  async createManyViewField(
    @Args() args: CreateManyViewFieldArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Prisma.BatchPayload> {
    return this.viewFieldService.createMany({
      data: args.data.map((dataItem) => ({
        ...dataItem,
        workspaceId: workspace.id,
      })),
    });
  }

  @Query(() => [ViewField])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadViewFieldAbilityHandler)
  async findManyViewField(
    @Args() args: FindManyViewFieldArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'ViewField' })
    prismaSelect: PrismaSelect<'ViewField'>,
  ): Promise<Partial<ViewField>[]> {
    return this.viewFieldService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).ViewField],
          }
        : accessibleBy(ability).ViewField,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => ViewField)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateViewFieldAbilityHandler)
  async updateOneViewField(
    @Args() args: UpdateOneViewFieldArgs,
    @PrismaSelector({ modelName: 'ViewField' })
    prismaSelect: PrismaSelect<'ViewField'>,
  ) {
    return this.viewFieldService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.ViewFieldUpdateArgs);
  }
}
