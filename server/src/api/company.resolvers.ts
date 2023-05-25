import { PrismaClient } from '@prisma/client';
import { Company } from './local-graphql/models';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { FindManyCompanyArgs } from './local-graphql/resolvers/crud/Company/args/FindManyCompanyArgs';

@Resolver(() => Company)
export class CompanyResolvers {
  constructor(private readonly prismaClient: PrismaClient) {}
  @Query(() => [Company])
  async companies(@Args() args: FindManyCompanyArgs) {
    return this.prismaClient.company.findMany(args);
  }
}
