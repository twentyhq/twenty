import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Person } from 'src/core/@generated/person/person.model';
import { FindManyPersonArgs } from 'src/core/@generated/person/find-many-person.args';
import { UpdateOnePersonArgs } from 'src/core/@generated/person/update-one-person.args';
import { CreateOnePersonArgs } from 'src/core/@generated/person/create-one-person.args';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyPersonArgs } from 'src/core/@generated/person/delete-many-person.args';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreatePersonAbilityHandler,
  DeletePersonAbilityHandler,
  ReadPersonAbilityHandler,
  UpdatePersonAbilityHandler,
} from 'src/ability/handlers/person.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';

import { PersonService } from './person.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Person)
export class PersonResolver {
  constructor(private readonly personService: PersonService) {}

  @Query(() => [Person], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPersonAbilityHandler)
  async findManyPerson(
    @Args() args: FindManyPersonArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Person' })
    prismaSelect: PrismaSelect<'Person'>,
  ): Promise<Partial<Person>[]> {
    return this.personService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).Person],
          }
        : accessibleBy(ability).Person,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Query(() => Person)
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadPersonAbilityHandler)
  async findUniquePerson(
    @Args('id') id: string,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Person' })
    prismaSelect: PrismaSelect<'Person'>,
  ): Promise<Partial<Person>> {
    return this.personService.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: prismaSelect.value,
    });
  }

  @ResolveField(() => String, {
    nullable: false,
  })
  displayName(@Parent() parent: Person): string {
    return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`;
  }

  @Mutation(() => Person, {
    nullable: true,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdatePersonAbilityHandler)
  async updateOnePerson(
    @Args() args: UpdateOnePersonArgs,
    @PrismaSelector({ modelName: 'Person' })
    prismaSelect: PrismaSelect<'Person'>,
  ): Promise<Partial<Person> | null> {
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

    return this.personService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.PersonUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeletePersonAbilityHandler)
  async deleteManyPerson(
    @Args() args: DeleteManyPersonArgs,
  ): Promise<AffectedRows> {
    return this.personService.deleteMany({
      where: args.where,
    });
  }

  @Mutation(() => Person, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreatePersonAbilityHandler)
  async createOnePerson(
    @Args() args: CreateOnePersonArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Person' })
    prismaSelect: PrismaSelect<'Person'>,
  ): Promise<Partial<Person>> {
    return this.personService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    } as Prisma.PersonCreateArgs);
  }
}
