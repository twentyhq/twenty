import { PrismaClient } from '@prisma/client';
import { Company } from '../generated-graphql/models';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { FindManyCompanyArgs } from '../generated-graphql/resolvers/crud/Company/args/FindManyCompanyArgs';
import { DeleteOneCompanyArgs } from '../generated-graphql/resolvers/crud/Company/args/DeleteOneCompanyArgs';
import { UpdateOneCompanyArgs } from '../generated-graphql/resolvers/crud/Company/args/UpdateOneCompanyArgs';
import { CreateOneCompanyArgs } from '../generated-graphql/resolvers/crud/Company/args/CreateOneCompanyArgs';
import {
  AffectedRowsOutput,
  DeleteManyCompanyArgs,
} from '../generated-graphql';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly prismaClient: PrismaClient) {}
  @Query(() => [Company])
  async companies(@Args() args: FindManyCompanyArgs) {
    return this.prismaClient.company.findMany(args);
  }

  @Mutation(() => Company, {
    nullable: true,
  })
  async deleteOneCompany(
    @Args() args: DeleteOneCompanyArgs,
  ): Promise<Company | null> {
    return this.prismaClient.company.delete(args);
  }

  @Mutation(() => Company, {
    nullable: true,
  })
  async updateOneCompany(
    @Args() args: UpdateOneCompanyArgs,
  ): Promise<Company | null> {
    return this.prismaClient.company.update({
      ...args,
    });
  }

  @Mutation(() => Company, {
    nullable: false,
  })
  async createOneCompany(@Args() args: CreateOneCompanyArgs): Promise<Company> {
    return this.prismaClient.company.create({
      ...args,
    });
  }

  @Mutation(() => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyCompany(
    @Args() args: DeleteManyCompanyArgs,
  ): Promise<AffectedRowsOutput> {
    return this.prismaClient.company.deleteMany({
      ...args,
    });
  }
}
