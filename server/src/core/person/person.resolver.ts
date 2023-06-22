import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Person } from '../../core/@generated/person/person.model';
import { FindManyPersonArgs } from '../../core/@generated/person/find-many-person.args';
import { UpdateOnePersonArgs } from '../../core/@generated/person/update-one-person.args';
import { CreateOnePersonArgs } from '../../core/@generated/person/create-one-person.args';
import { AffectedRows } from '../../core/@generated/prisma/affected-rows.output';
import { DeleteManyPersonArgs } from '../../core/@generated/person/delete-many-person.args';
import { Workspace } from '../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../decorators/auth-workspace.decorator';
import { Prisma } from '@prisma/client';
import { UpdateOneGuard } from '../../guards/update-one.guard';
import { DeleteManyGuard } from '../../guards/delete-many.guard';
import { CreateOneGuard } from '../../guards/create-one.guard';
import { PersonService } from './person.service';
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
import { accessibleBy } from '@casl/prisma';

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
      ...args,
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).Person],
          }
        : accessibleBy(ability).Person,
      select: prismaSelect.value,
    });
  }

  @UseGuards(UpdateOneGuard)
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
    if (!args.data.company?.connect?.id) {
      args.data.company = { disconnect: true };
    }

    return this.personService.update({
      ...args,
      select: prismaSelect.value,
    } as Prisma.PersonUpdateArgs);
  }

  @UseGuards(DeleteManyGuard)
  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeletePersonAbilityHandler)
  async deleteManyPerson(
    @Args() args: DeleteManyPersonArgs,
  ): Promise<AffectedRows> {
    return this.personService.deleteMany({
      ...args,
    });
  }

  @UseGuards(CreateOneGuard)
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
