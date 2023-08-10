import { Module } from '@nestjs/common';

import { ViewFieldService } from './services/view-field.service';
import { ViewFieldResolver } from './resolvers/view-field.resolver';
import { ViewSortService } from './services/view-sort.service';
import { ViewSortResolver } from './resolvers/view-sort.resolver';

@Module({
  providers: [
    ViewFieldService,
    ViewSortService,
    ViewFieldResolver,
    ViewSortResolver,
  ],
})
export class ViewModule {}
