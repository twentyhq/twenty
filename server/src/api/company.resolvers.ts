import { Company } from './graphql/models';
import { Resolver, Query } from '@nestjs/graphql';

@Resolver(() => Company)
export class CompanyResolvers {
  @Query(() => Company)
  async companies() {
    return {
      id: '1',
      name: 'Nest',
      description: 'Nest Framework',
    };
  }
}
