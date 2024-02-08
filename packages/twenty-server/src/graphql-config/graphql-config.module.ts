import { Module } from '@nestjs/common';

import { CoreModule } from 'src/core/core.module';
import { graphQLFactories } from 'src/graphql-config/factories';

@Module({
  imports: [CoreModule],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
