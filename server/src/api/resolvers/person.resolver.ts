import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Person } from '../@generated/person/person.model';
import { FindManyPersonArgs } from '../@generated/person/find-many-person.args';
import { UpdateOnePersonArgs } from '../@generated/person/update-one-person.args';
import { CreateOnePersonArgs } from '../@generated/person/create-one-person.args';
import { AffectedRows } from '../@generated/prisma/affected-rows.output';
import { DeleteManyPersonArgs } from '../@generated/person/delete-many-person.args';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { ArgsService } from './services/args.service';
import { CheckWorkspaceOwnership } from 'src/auth/guards/check-workspace-ownership.guard';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard, CheckWorkspaceOwnership)
@Resolver(() => Person)
export class PersonResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [Person], {
    nullable: false,
  })
  async findManyPerson(
    @Args() args: FindManyPersonArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Person[]> {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyPersonArgs>(
        args,
        workspace,
      );
    return this.prismaService.person.findMany({
      ...preparedArgs,
    });
  }

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
    } satisfies UpdateOnePersonArgs as Prisma.PersonUpdateArgs);
  }

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

  @Mutation(() => Person, {
    nullable: false,
  })
  async createOnePerson(
    @Args() args: CreateOnePersonArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Person> {
    return this.prismaService.person.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    });
  }
}
