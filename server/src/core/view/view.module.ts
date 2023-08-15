import { Module } from '@nestjs/common';

import { ViewFieldService } from './services/view-field.service';
import { ViewFieldResolver } from './resolvers/view-field.resolver';
import { ViewSortService } from './services/view-sort.service';
import { ViewSortResolver } from './resolvers/view-sort.resolver';
import { ViewService } from './services/view.service';
import { ViewResolver } from './resolvers/view.resolver';

@Module({
  providers: [
    ViewService,
    ViewFieldService,
    ViewSortService,
    ViewResolver,
    ViewFieldResolver,
    ViewSortResolver,
  ],
})
export class ViewModule {}
