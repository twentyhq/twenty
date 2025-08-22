import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { LicenseGenerationJob } from 'src/mkt-core/license/jobs/license-generation.job';
import { MktLicenseApiService } from 'src/mkt-core/license/mkt-license-api.service';
import { MktLicenseCreateOnePreQueryHook } from 'src/mkt-core/license/mkt-license-create-one.pre-query.hook';
import { MktLicenseService } from 'src/mkt-core/license/mkt-license.service';

@Module({
  imports: [HttpModule],
  providers: [
    MktLicenseService,
    MktLicenseCreateOnePreQueryHook,
    MktLicenseApiService,
    LicenseGenerationJob,
  ],
})
export class MktLicenseModule {}
