import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { CreateManyViewFieldsTool } from 'src/engine/metadata-modules/view-field/tools/create-many-view-fields.tool';
import { CreateViewFieldTool } from 'src/engine/metadata-modules/view-field/tools/create-view-field.tool';
import { DeleteViewFieldTool } from 'src/engine/metadata-modules/view-field/tools/delete-view-field.tool';
import { GetViewFieldsTool } from 'src/engine/metadata-modules/view-field/tools/get-view-fields.tool';
import { UpdateManyViewFieldsTool } from 'src/engine/metadata-modules/view-field/tools/update-many-view-fields.tool';
import { UpdateViewFieldTool } from 'src/engine/metadata-modules/view-field/tools/update-view-field.tool';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { CreateManyViewFiltersTool } from 'src/engine/metadata-modules/view-filter/tools/create-many-view-filters.tool';
import { CreateViewFilterTool } from 'src/engine/metadata-modules/view-filter/tools/create-view-filter.tool';
import { DeleteViewFilterTool } from 'src/engine/metadata-modules/view-filter/tools/delete-view-filter.tool';
import { GetViewFiltersTool } from 'src/engine/metadata-modules/view-filter/tools/get-view-filters.tool';
import { UpdateViewFilterTool } from 'src/engine/metadata-modules/view-filter/tools/update-view-filter.tool';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { CreateManyViewSortsTool } from 'src/engine/metadata-modules/view-sort/tools/create-many-view-sorts.tool';
import { CreateViewSortTool } from 'src/engine/metadata-modules/view-sort/tools/create-view-sort.tool';
import { DeleteViewSortTool } from 'src/engine/metadata-modules/view-sort/tools/delete-view-sort.tool';
import { GetViewSortsTool } from 'src/engine/metadata-modules/view-sort/tools/get-view-sorts.tool';
import { UpdateViewSortTool } from 'src/engine/metadata-modules/view-sort/tools/update-view-sort.tool';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { CreateViewTool } from 'src/engine/metadata-modules/view/tools/create-view.tool';
import { DeleteViewTool } from 'src/engine/metadata-modules/view/tools/delete-view.tool';
import { GetViewQueryParametersTool } from 'src/engine/metadata-modules/view/tools/get-view-query-parameters.tool';
import { GetViewsTool } from 'src/engine/metadata-modules/view/tools/get-views.tool';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';
import { ViewToolIdentifierService } from 'src/engine/metadata-modules/view/tools/services/view-tool-identifier.service';
import { UpdateViewTool } from 'src/engine/metadata-modules/view/tools/update-view.tool';
import { UpsertCompleteViewTool } from 'src/engine/metadata-modules/view/tools/upsert-complete-view.tool';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';

@Module({
  imports: [
    ViewModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewSortModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    ViewToolAccessService,
    ViewToolIdentifierService,
    GetViewsTool,
    GetViewQueryParametersTool,
    GetViewFieldsTool,
    GetViewFiltersTool,
    GetViewSortsTool,
    UpsertCompleteViewTool,
    CreateViewTool,
    UpdateViewTool,
    DeleteViewTool,
    CreateViewFieldTool,
    UpdateViewFieldTool,
    DeleteViewFieldTool,
    CreateManyViewFieldsTool,
    UpdateManyViewFieldsTool,
    CreateViewFilterTool,
    CreateManyViewFiltersTool,
    UpdateViewFilterTool,
    DeleteViewFilterTool,
    CreateViewSortTool,
    CreateManyViewSortsTool,
    UpdateViewSortTool,
    DeleteViewSortTool,
  ],
})
export class ViewToolsModule {}
