import { PrismaClient } from '@prisma/client';
import { Company } from './graphql/models';
import { Resolver, Query } from '@nestjs/graphql';

@Resolver(() => Company)
export class CompanyResolvers {
  constructor(private readonly prismaClient: PrismaClient) {}
  @Query(() => [Company])
  async companies() {
    return this.prismaClient.company.findMany();
  }
}
