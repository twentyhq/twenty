import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { User, UserType } from './decorators/user.decorator';
import { PrismaService } from 'src/database/prisma.service';
import { Person } from '../@generated/person/person.model';
import { FindManyPersonArgs } from '../@generated/person/find-many-person.args';
import { UpdateOnePersonArgs } from '../@generated/person/update-one-person.args';
import { CreateOnePersonArgs } from '../@generated/person/create-one-person.args';
import { AffectedRows } from '../@generated/prisma/affected-rows.output';
import { DeleteManyPersonArgs } from '../@generated/person/delete-many-person.args';

@Resolver(() => Person)
export class PeopleResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Person], {
    nullable: false,
  })
  async people(@Args() args: FindManyPersonArgs): Promise<Person[]> {
    return this.prismaService.person.findMany({
      ...args,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Person, {
    nullable: true,
  })
  async updateOnePerson(
    @Args() args: UpdateOnePersonArgs,
  ): Promise<Person | null> {
    if (!args.data.company?.connect?.id) {
      args.data.company = { disconnect: true };
    }
    return this.prismaService.person.update({
      ...args,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Person, {
    nullable: false,
  })
  async createOnePerson(
    @Args() args: CreateOnePersonArgs,
    @User() user: UserType,
  ): Promise<Person> {
    return this.prismaService.person.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: user.workspaceId } } },
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  async deleteManyPerson(
    @Args() args: DeleteManyPersonArgs,
  ): Promise<AffectedRows> {
    return this.prismaService.person.deleteMany({
      ...args,
    });
  }
}
