import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { ViewFieldService } from './services/view-field.service';
import { ViewFieldResolver } from './resolvers/view-field.resolver';
import { ViewSortService } from './services/view-sort.service';
import { ViewSortResolver } from './resolvers/view-sort.resolver';
import { ViewService } from './services/view.service';
import { ViewResolver } from './resolvers/view.resolver';
import { ViewFilterService } from './services/view-filter.service';
import { ViewFilterResolver } from './resolvers/view-filter.resolver';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [
    ViewService,
    ViewFieldService,
    ViewFilterService,
    ViewSortService,
    ViewResolver,
    ViewFieldResolver,
    ViewFilterResolver,
    ViewSortResolver,
  ],
  exports: [ViewService],
})
export class ViewModule {}
