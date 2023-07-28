import { Module } from '@nestjs/common';

import { ViewFieldService } from './services/view-field.service';
import { ViewFieldResolver } from './resolvers/view-field.resolver';

@Module({
  providers: [ViewFieldService, ViewFieldResolver],
})
export class ViewModule {}
