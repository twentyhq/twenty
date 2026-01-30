import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PageLayoutWidgetModule } from 'src/engine/metadata-modules/page-layout-widget/page-layout-widget.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

@Module({
  imports: [
    CoreCommonApiModule,
    PageLayoutWidgetModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TwentyORMModule,
  ],
  providers: [
    ChartDataQueryService,
    PieChartDataService,
    PieChartDataResolver,
    LineChartDataService,
    LineChartDataResolver,
    BarChartDataService,
    BarChartDataResolver,
  ],
  exports: [PieChartDataService, LineChartDataService, BarChartDataService],
})
export class ChartDataModule {}
