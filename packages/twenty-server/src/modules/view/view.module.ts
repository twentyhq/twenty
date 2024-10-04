import { Module } from '@nestjs/common';

import { ViewService } from 'src/modules/view/services/view.service';

@Module({
  imports: [],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
