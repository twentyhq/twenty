import { Company } from '@generated/type-graphql';
import { PrismaService } from '../../database/prisma.service';
import { Resolver, Query } from 'type-graphql';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Company])
  async getCompaniesOfSammy(): Promise<Company[] | null> {
    return await this.prisma.company.findMany({
      where: {},
    });
  }
}
