import { Module } from '@nestjs/common';
import { ViewDeleteOnePreQueryHook } from 'src/modules/view/pre-hooks/view-delete-one.pre-query.hook';

import { ViewService } from 'src/modules/view/services/view.service';

@Module({
  imports: [],
  providers: [ViewService, ViewDeleteOnePreQueryHook],
  exports: [ViewService],
})
export class ViewModule {}
