import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Person } from '../models/person.model';
import { PersonRepository } from 'src/entities/person/person.repository';
import { CompanyRepository } from 'src/entities/company/company.repository';

@Resolver(() => Person)
export class PersonResolver {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  @Query(() => [Person])
  async getPeople() {
    return this.personRepository.findMany({});
  }

  @ResolveField()
  company(@Parent() person: Person) {
    return this.companyRepository.findOne(person.companyId);
  }
}
