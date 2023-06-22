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
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => Person)
export class PersonResolver {
  constructor(private readonly personService: PersonService) {}

  @Query(() => [Person], {
    nullable: false,
  })
  async findManyPerson(
    @Args() args: FindManyPersonArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Person' })
    prismaSelect: PrismaSelect<'Person'>,
  ): Promise<Partial<Person>[]> {
    const preparedArgs = prepareFindManyArgs<FindManyPersonArgs>(
      args,
      workspace,
    );

    return this.personService.findMany({
      ...preparedArgs,
      select: prismaSelect.value,
    });
  }

  @UseGuards(UpdateOneGuard)
  @Mutation(() => Person, {
    nullable: true,
  })
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
