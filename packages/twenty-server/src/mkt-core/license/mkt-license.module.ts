import { Module } from '@nestjs/common';

import { MktLicenseCreateOnePreQueryHook } from 'src/mkt-core/license/mkt-license-create-one.pre-query.hook';
import { MktLicenseService } from 'src/mkt-core/license/mkt-license.service';

@Module({
  providers: [MktLicenseService, MktLicenseCreateOnePreQueryHook],
})
export class MktLicenseModule {}
