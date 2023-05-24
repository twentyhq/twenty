import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CompanyRepository } from 'src/entities/company/company.repository';
import { Company } from '../models/company.model';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  @Query(() => [Company])
  async getCompanies() {
    return this.companyRepository.findMany({});
  }
}