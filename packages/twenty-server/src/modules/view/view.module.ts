import { Module } from '@nestjs/common';

import { ViewService } from 'src/modules/view/services/view.service';

import { ViewDeleteOnePreQueryHook } from './pre-hooks/view-delete-one.pre-query.hook';
@Module({
  imports: [],
  providers: [ViewService, ViewDeleteOnePreQueryHook],
  exports: [ViewService],
})
export class ViewModule {}
